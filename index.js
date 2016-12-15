const os = require("os")
const execFile = require('child_process').execFile;
const ip = require("ip");
const net = require('net');
const range = require('node-range');
const _ = require('lodash')
var cp = require('child_process');

var http = require('http');
var children = []


var ips = []
var my_ip = ip.address()

Array.prototype.diff = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};

if (os.type() == "Darwin") { //'Linux', 'Windows_NT' - arp -a works on all.. parse differently
  //run command to get ips and blast
  //arp -na
  var child = execFile('arp', ['-a'], (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr);
      throw error;
    }
    ips = get_ips(stdout).diff( [my_ip] )
    start_server(ips)
  });

} else {

}

function get_ips(str){
  var strs = str.split(/\r?\n/)
  var t_ip = []
  var regExp = /\(([^)]+)\)/;
  for (var s of strs){
    var matches = regExp.exec(s);
    if (matches != null ){
      t_ip.push(matches[1])
    }
  }
  return t_ip
}


//ping and register all when ready
//start server and attempt to connect to another server.. - send initial and on recieve, send back

function start_server(ads){
  var server = net.createServer(function(socket) {
    socket.write(`Echo (${my_ip}) server\r\n`);
    socket.pipe(socket);
  });

  server.listen(1337, my_ip); // long running should be in seperate process, blocks client

  server.on('data', function(data) {
    console.log('Server Received: ' + data);
  })

  //1. spin up
  range(0, ads.length).forEach (i => {
    console.log(ads[i])
    children.push(cp.fork('./client'))
  })

  for (var i = 0; i < children.length; i++){
    var child = children[i]
    child.send({ip: ads[i]})
  }

  //3. wait for response
  for (let child of children) {
    child.on('message', function(m) {
      // console.log(`from child: ${m}`)
    })
  }

}





//client



