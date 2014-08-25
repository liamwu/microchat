var server = require("./server.js");
var argv = require('optimist').argv;
var port = argv.p || argv.port || 8888;

console.log('Ports: ' + port);

server.startService(port);
