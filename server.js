var app = require('http').createServer(qtalk),
    io = require('socket.io').listen(app),
    path = require('path'),
    fs = require('fs'),
    url = require('url'),
    dns = require('dns');

function startService(port) {
	app.listen(port);
}

	//render the page

	function qtalk(req, res) {
		var file = getResource(req.url == '/' ? url.parse('/index.html') : url.parse(req.url));
		if (file) {
			fs.readFile(file,
			    function(err, data) {
				if (err) {
				    res.writeHead(500);
				    return res.end("error");
				}
				res.writeHead(200);
				res.end(data);
			    });
		} else {
		console.log("Not available" + req.url);
		res.writeHead(404);
		res.write("Not available page");
		res.end();
		}
	}

	//talk history list
	var noteList = new Array();

	//talk history (output string)
	var notes = "";

	//disable debug
	io.set('log level', 1);

	//wrap for new message
	var line = "<div class='lc'></div>";

	//add socket events
	io.sockets.on('connection', function(socket) {

		dns.reverse(socket.handshake.address.address, function(err, hostnames) {
			console.log(hostnames + "(" + socket.id + "##" + socket.handshake.address.address + ") is connected now!");
			socket.set('hostname', hostnames[0]);
		});

		socket.on('msg', function(data) {
			console.log("Received message from(" + socket.handshake.address.address + "): " + data);
			var ccs = io.sockets.clients();
			console.log("Online users: " + ccs.length);

			if (data != null) {
				var clientName = getClientName("hostname", socket);
				var user = "<div class='un'>" + clientName + "</div>";
				var rede = data.replace(/</g, "&lt;");
				var cont = toHtml(rede);
				var now = new Date();
				var times = "<div class='sh'><div class='tsr'>" + now.toTimeString().split(' ', 1) + "</div></div>";
				var noteChild = user + cont + times;
				//the latest 100 message will be broadcasted
				noteList = talkList(noteList, noteChild, 100);
				//output as string
				notes = noteList.join(line);
			}
			console.log("Notes: " + notes);

			socket.emit('notes', {
				msg: notes,
				flag_highlight: false
			});

			socket.broadcast.emit('notes', {
				msg: notes,
				flag_highlight: true
			});
		});

		socket.on('notes', function() {
			socket.emit('notes', {
				msg: notes
			});
		});

		socket.on('disconnect', function() {
			console.log(socket.handshake.address.address + " disconnect now...");
		});

		socket.on('ulist', function() {
			console.log();
		});
	});

	//talk history list

	function talkList(lis, data, size) {
		if (lis.length > size - 1) {
			lis.splice(0, 1);
			lis.push(data);
		} else {
			lis.push(data);
		}

		return lis;
	}

	//get client domain name

	function getClientName(name, soc) {
		var out = "";
		out = getSocPro(name, soc).split(".", 1);
		return out;
	}

	//get socket property

	function getSocPro(lab, soc) {
		var out = "";
		soc.get(lab, function(err, name) {
			if (err) {
				console.log(err.message);
			} else {
				out = name;
			}
		});
		console.log(out);
		return out;
	}

	//break the message to divs

	function toHtml(source) {
		var datas = source.split('\n');
		var outs = "";
		for (i in datas) {
			var cc = "<div class='cont'>" + toLink(datas[i]) + "</div>";
			outs = outs + cc;
		}
		return outs;
	}

	//scan words, will return a link if it is a link

	function toLink(sou) {
		var out = "";
		var goal = new Array(".org", ".com", ".cn", ".org", ".net", ".info", ".edu", ".gov");
		var datas = sou.split(' ');
		for (j in datas) {
			out += matchDomain(datas[j], goal);
		}
		return out;
	}

//restrict access files to block directory traversal
function getResource(urlLeaf) {
    var ext = path.extname(urlLeaf.pathname);
    var folder = null;

    switch (ext) {
        case ".js":
            folder = __dirname + "/js/";
            break;
        case ".css":
            folder = __dirname + "/css/";
            break;
        case ".png":
            folder = __dirname + "/img/";
            break;
        case ".gif":
            folder = __dirname + "/img/";
            break;
        case ".ico":
            folder = __dirname + "/img/";
            break;
        case ".html":
            folder = __dirname + "/";
            break;
        default:
            return false;
    }

    console.log("Access file: " + folder + path.basename(urlLeaf.pathname));
    if (path.existsSync(folder + path.basename(urlLeaf.pathname))) {
        return folder + path.basename(urlLeaf.pathname);
    } else {
        return false;
    }
}

	//return a link if it match a domain name

	function matchDomain(sou, ara) {
		var out = sou;
		for (i in ara) {
			var zz = new RegExp(ara[i], "i");
			if (sou.search(zz) >= 0) {
				if (sou.search(/^http:/) >= 0 || sou.search(/^https:/) >= 0) {
					out = "<a target='_blank' href='" + sou + "'>" + sou + "</a>";
				} else {
					out = "<a target='_blank' href='http://" + sou + "'>" + sou + "</a>";
				}
				break;
			}
		}
		return '&nbsp;' + out;
	}

exports.startService = startService;
