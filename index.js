const os = require("os")
const execFile = require('child_process').execFile;
const ip = require("ip");


var ips = []
var my_ip = ip.address()

if (os.type() == "Darwin") { //'Linux', 'Windows_NT' - arp -a works on all.. parse differently
  //run command to get ips and blast
  //arp -na
  var child = execFile('arp', ['-a'], (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr);
      throw error;
    }
    ips = get_ips(stdout)
    console.log(ips)
    console.log(my_ip)
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
