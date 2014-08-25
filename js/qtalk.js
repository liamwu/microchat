$(document).ready(function() {
	//global socket(don't declare a global variable in var)
	SOCKET = "";
	CONNECTION = false;
	FIRSTLOG = true;
	qtalk();
	removeHightlight();
	openEmoji();
	addEmoji();
});

//QTalk

function qtalk() {
	connectQT();
	disconnectQT();
	sendMsg();
}

//connect socket

function connect() {
	if (FIRSTLOG) {
		SOCKET = io.connect('http://localhost:8888');

		SOCKET.on('connect', function() {
			$("#status").html("Connected");
			openTb();
			getNotes();
		});

		SOCKET.on('disconnet', function() {});

		SOCKET.on('notes', function(data) {
			console.log(data);
			$("#notes").html(data.msg);
			if (data.flag_highlight) {
				$("#appbar").css("background-color", "#2d72d8");
			}
			toTop();
		});

		FIRSTLOG = false;
	} else {
		SOCKET.socket.reconnect();
	}
}

//get notes for first login

function getNotes() {
	SOCKET.emit('notes');
}

//press enter to submit msg

function sendMsg() {
	$("#message").keypress(function(evt) {
		if (evt.keyCode == 13 && evt.shiftKey) {
			return true;
		} else if (evt.keyCode == 13) {
			var note = $("#note").val();
			if (note.trim() != "") {
				SOCKET.emit('msg', note);
				$('#note').val("");
			}
			return false;
		}
	});
}

//toggle chat

function toggleQT() {
	$("#tb").toggle();

}

//connect socket

function connectQT() {
	$("#conn").click(function() {
		if (CONNECTION == false) {
			connect();
			CONNECTION = true;
		} else {
			toggleQT();
		}
	});
}

//disconnect socket

function disconnectQT() {
	$("#disconn").click(function() {
		SOCKET.disconnect();
		closeTb();
		CONNECTION = false;
		$("#status").html("Disconnected");
	});
}

//open talk window

function openTb() {
	$("#tb").show();
}

//close talk window

function closeTb() {
	$("#tb").hide();
}

//always scroll the notes to bottom

function toTop() {
	var myscroll = $('#notes');
	myscroll.scrollTop(myscroll.get(0).scrollHeight);
}

//remove msg hightlight

function removeHightlight() {
	$("#qtalk").click(function() {
		$("#appbar").css("background-color", "#444");
	});
}

//open emoji table

function openEmoji() {
	$(".footer img").click(function() {
		$(".emoji").toggle();
	});
}

//add emoji to textarea

function addEmoji(){
	$(".emoji span").click(function() {
		var emoji = $(this).html();
		var text = $("#note").val() + emoji;
		$(".emoji").css("display", "none");
		$("#note").focus().val("").val(text);
	});
}
