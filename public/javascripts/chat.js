var preRoom = '';
var adder = true;
var deler = true;
$(document).ready(function(){
  var socket = io.connect();
  var from = $.cookie('user');//从 cookie 中读取用户名，存于变量 from
  var to = 'all';//设置默认接收对象为"所有人"
  //javascript:window.history.forward(2);
    socket.on('adder',function(data){
				console.log('adder 執行 shezhi -adder='+data.adder);
				adder = data.adder;
	});
    socket.on('deler',function(data){
				console.log('deler 執行 shezhi -deler='+data.deler);
				deler = data.deler;
	});
    window.onhashchange = function() {
		if ((location.href == 'http://localhost:3333/')&&(adder==false)){
			console.log('XXX.= preRoom='+preRoom);
			if(preRoom!=''){
				//alert('  sda preRoom='+preRoom);
			  socket.emit('deluser_out',{username:from}); 
			  $("#contents").empty();
			  adder = true;
			  deler = true;
			}
		}
		if((location.href == 'http://localhost:3333/#chatPage')&&(deler==false)){	
				console.log('adduser_in 執行');
				socket.emit('adduser_in',{username:from,room:preRoom});	
				adder = false;
 				deler = true;
				$("#contents").empty();
		}
	}

	$("#backhome").click(function(){
    		socket.emit('deluser',{username:from}); 
		$("#contents").empty();
		 adder = true;
		 deler = true;
    });

    $(window).keydown(function(e){
		if(e.keyCode == 116)
		{
			if(!confirm("刷新可能丢失链接数据所有数据情况，确定要刷新么？"))
			{
				e.preventDefault();
			}
		}
  });
    socket.on('update_userno',function(data){
    	$("#room1_no").html(data.no1);
    	$("#room2_no").html(data.no2);
    	$("#room3_no").html(data.no3);
    	$("#room4_no").html(data.no4);
    });
    $("#room1").click(function(){
	    	socket.emit('adduser',{username:from,room:'room1'});
	    	preRoom = 'room1';
    });
    $("#room2").click(function(){
	    	socket.emit('adduser',{username:from,room:'room2'});
	    	preRoom = 'room2';
    });
    $("#room3").click(function(){
	    	socket.emit('adduser',{username:from,room:'room3'});
	    	preRoom = 'room3';
    });
    $("#room4").click(function(){
	    	socket.emit('adduser',{username:from,room:'room4'});
	    	preRoom = 'room4';
    });
    
	//socket.on('updatechat',function(username, data){
	socket.on('updatechat',function(data, users){
		console.log("showing--------------------");
		var in_room;
		switch(data.room){
		      case 'room1':
		        in_room = "交友吧";
		        break;
		      case 'room2':
		         in_room = "同乡会";
		        break;
		      case 'room3':
		        in_room = "追星族";
		        break;
		      case 'room4':
		         in_room = "体育迷";
		        break;
		 }
		var lastStr = $('#contents').children().last().text();
		var lastStr2 = $.trim(lastStr);
		if(data.username!=from){
			var newline1 = data.username+'进入了'+in_room+'房间';
			if(parser(lastStr2)!=newline1){
			$('#contents').append('<div style="color:#f00;">(' + now() + ')'+data.username + '进入了' + in_room + '房间<br></div>');
			$("#contents").scrollTop($("#contents")[0].scrollHeight);
		      }
		}else{
			var newline2 = '您进入了'+in_room+'房间';
			if(parser(lastStr2)!=newline2){
			$('#contents').append('<div style="color:#f00;">(' + now() + ')'+'您进入了' + in_room + '房间<br></div>');
			$("#contents").scrollTop($("#contents")[0].scrollHeight);
			}
		}
		play_ring("/ring/online.wav");
		console.log("到这里"+in_room);
		$("#roomname").html(in_room);
		initUserList(users);
	  //显示正在对谁说话
		showSayTo();
	});

	function parser(str){
		//var line = str.toString();
		var parts = str.split(')');
		var str1 = parts[1];
		return str1;
	}

	socket.on('leftroom',function(username,users){
	  //显示系统消息
	  var sys = '<div style="color:#f00;">(' + now() + '):' + '用户 ' + username + ' 离开了！<br/></div>';
	  $("#contents").append(sys);
	  $("#contents").scrollTop($("#contents")[0].scrollHeight);
	  //刷新用户在线列表
	  removeUser(username);
	  if(username == to){
		to = "all";
		$('#userList').prev().children().first().text("all");
	  }
	 
	  initUserList(users);
	  //显示正在对谁说话
	  showSayTo();
	  $("#userList").val("all");
	});

	socket.on('say',function(data){
	//对所有人说

	 if(data.to == 'all'){
		$("#contents").append('<div>(' + now() + ')' + data.from + '说：<br/>' + data.msg + '<br /></div>');

		$("#contents").scrollTop($("#contents")[0].scrollHeight);
	 }
	  //对你密语
	 if(data.to == from){
		$("#contents").append('<div style="color:#00ff00;" >(' + now() + ')' + data.from + '对 你 说：<br/>' + data.msg + '<br /></div>');
	      $("#contents").scrollTop($("#contents")[0].scrollHeight);
	      play_ring("/ring/msg.wav");
	  }
	});

	  //服务器关闭
  socket.on('disconnect',function(){
    var sys = '<div style="color:#f00;float:center">(' + now() + ')系统:连接服务器失败！</div>';
    $("#contents").append(sys + "<br/>");
    $("#contents").scrollTop($("#contents")[0].scrollHeight);
    $("#list").empty();
  });

	//刷新用户在线列表
	function flushUsers(users){
	  //清空之前用户列表，添加 "所有人" 选项并默认为灰色选中效果

	 console.log("刷新用户列表"+users.length);
	  $("#list").empty().append('<li title="双击聊天" class="sayingto" alt="all">所有人</li>');
	  //遍历生成用户在线列表
	  for(var i in users){
	    //$("#list").append('<li alt="' + users[i] + '" title="双击聊天">' + users[i] + '</li>');
	  	$("#list").append('<li alt="' + users[i] + '" title="双击聊天">' + users[i] + '</li>');
	  }
	  //双击对某人聊天
	  $("#list > li").click(function(){
	    //如果不是双击的自己的名字
	    if($(this).attr('alt') != from){
	      //设置被双击的用户为说话对象
	      to = $(this).attr('alt');
	      //清除之前的选中效果sayingto
	     $("#list > li").removeClass('sayingto');
	      //给被双击的用户添加选中效果
	     $(this).addClass('sayingto');
	      //刷新正在对谁说话
	      showSayTo();
	    }
	 });
	}


	//显示正在对谁说话
	function showSayTo(){
	  $("#from").html(from);
	  $("#to").html(to == "all" ? "所有人" : to);
	}

	//获取当前时间
	function now(){
	  var date = new Date();
	  var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
	  var time1 = date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
	  return time1;
	}

	//播放声音
	function play_ring(url){
		var embed = '<embed id="ring" src="'+url+'" loop="0" autostart="true" hidden="true" style="height:0px; width:0px;0px;"></embed>';
		$("#ring").html(embed);
	}
	$("#say").click(function(){
	  //获取要发送的信息
	  var $msg = $('#input_content').val();
	  //var $msg = "hello";
	  console.log($msg+"===QQ"+"msg:"+$("#input_content").html());
	  if($msg == "") return;
	  //把发送的信息先添加到自己的浏览器 DOM 中
	  if(to == "all"){
		$("#contents").append('<div >(' + now() + ')你说:<br/>' + $msg + '<br/></div>');
		$("#contents").scrollTop($("#contents")[0].scrollHeight);
	  } else {
		$("#contents").append('<div  style="color:#00ff00;" >(' + now() + ')你对 ' + to + ' 说：<br/>' + $msg + '<br/></div>');
		$("#contents").scrollTop($("#contents")[0].scrollHeight);
	  }
	  //发送发话信息
	  socket.emit('say',{from:from,to:to,msg:$msg});
	  //清空输入框并获得焦点
	  //$('#input_content').val('').focus();
	  $('#input_content').val('');
	});
		// init user list
	function initUserList(users) {
		//removeUser(username);
		var str = $("#userList").children("option");
		var str1 = [];
		console.log("初始化列表");
		$.each(str,function(){
				str1.unshift($(this).val());
		});	
		for(var i = 0; i < users.length; i++) {			
			if(str1.indexOf(users[i]) == -1){
				if(users[i]!=from){
					var slElement = $(document.createElement("option"));
					slElement.attr("value", users[i]);
					slElement.text(users[i]);
					$("#userList").append(slElement);
				}
			}
		}
	};

	$("#userList").change(function(){
			if($(this).attr('value') != from){
		      //设置被双击的用户为说话对象
		      to = $(this).attr('value');
		      showSayTo();
		    }
	});
	// add user in user list
	function addUser(user) {
		var slElement = $(document.createElement("option"));
		slElement.attr("value", user);
		slElement.text(user);
		$("#userList").append(slElement);
	};

	// remove user from user list
	function removeUser(user) {
		console.log("removeuser");
		$("#userList option").each(
			function() {
				if($(this).val() === user) $(this).remove();
		});
	};


});