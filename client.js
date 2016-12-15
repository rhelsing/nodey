const net = require('net');
var backoff = 0

process.on('message', function(m) {
  listen_to(m.ip)
});

function listen_to(ip){
  var client = new net.Socket()

  client.on('error', (err) => {
    console.log(`could not connect to ${ip}`)
    if(err.code == 'ECONNREFUSED') {
      backoff++
      if(backoff > 3){
        console.log("giving up forevermore on "+ip)

      }else{
        client.setTimeout(10000, function() {
          client.connect(1337, ip, function(){
            console.log('Connected');
            client.write(`Hello, server! Love, Client. ${ip}`);
          });
        });
        console.log("will try again in about 10 seconds")
      }
    }
    //try again in 5 seconds.. exponential backoff
  });

  client.connect(1337, ip, function() {
    console.log('Connected');
    client.write(`Hello, server! Love, Client. ${ip}`);
  });
  client.on('data', function(data) {
    console.log('Received: ' + data);
    client.destroy(); // kill client after server's response
  });

  client.on('close', function() {
    console.log('Connection closed');
    process.send("closed")
    // process.exit() //if surpassed threshold of exponential backoff
  });

}
