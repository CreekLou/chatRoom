
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3333);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
var rooms = ['room1','room2','room3','room4'];
var users = [];//存储所有的用户
app.get('/', function(req,res){
  if(req.cookies.user == null){
    //注意要有 return
    return res.redirect('/signin');
  }
  res.sendfile('views/rooms.html');
  console.log("app.js----55555");
});
app.get('/signin',function(req,res){
  res.sendfile('views/signin.html');
});
app.get('/rooms',function(req,res){
  if(req.cookies.user == null){
    //注意要有 return
    return res.redirect('/signin');
  }
  res.sendfile('views/rooms.html');
});
/*app.get('/:room',function(req,res){
  if(req.cookies.user == null){
    //注意要有 return
  console.log("app.js-----444444--app.get('/')--req.cookies.user");
    return res.redirect('/signin');
  }
  var room = req.params.room;
  var user = req.cookies.user;
  res.render();
  //res.sendfile('views/room1.html');
  console.log("app.js----app.get('/room1')--------");
});*/
app.post('/signin',function(req,res){
  //检测该用户名是否已经存在于 users 数组中
  console.log("app.js----7777777--app.post('/signin')");
  console.log("======="+req.body.name);
  console.log("-------"+users);
  if(users.indexOf(req.body.name) != -1){
    //存在，则不允许登陆
    console.log("存在，则不允许登陆");
    res.redirect('/signin');
    res.send({errorCode : -1});
    //res.redirect('/signin');
  } else {
    //不存在，把用户名存入 cookie 并跳转到主页
    res.cookie("user",req.body.name,{maxAge:1000*60*60*24*30});
    users.unshift(req.body.name);
    res.send({errorCode : 0});
    //res.redirect('/');
  }
});
var xroom = 'room1';
var usernames = {};
var user_room1 = [];
var user_room2 = [];
var user_room3 = [];
var user_room4 = [];
var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.sockets.on('connection',function(socket){
  //有人上线
  var in_room = false;//user和user所加入的房间。
  var out_room = false;
  console.log("socket链接=====有人上线=======");
  //用户进入指定的room
  socket.emit('update_userno',{no1:user_room1.length,no2:user_room2.length,no3:user_room3.length,no4:user_room4.length});
  //socket.broadcast.emit('update_userno',{no1:user_room1.length,no2:user_room2.length,no3:user_room3.length,no4:user_room4.length});
  console.log("room1人数=="+user_room1.length);
  //添加人數到指定房間
  socket.on('adduser',function(data){
    var check_room = data.room;
    var userno = []; 
    socket.username = data.username;
    socket.room = data.room;
    usernames[data.username] = data.username;
    socket.join(data.room);
    switch(check_room){
      case 'room1':
        if(user_room1.indexOf(data.username) == -1){
        user_room1.unshift(data.username);
        }
        userno = user_room1;
        break;
      case 'room2':
        if(user_room2.indexOf(data.username) == -1){
        user_room2.unshift(data.username);
        }
        userno = user_room2;
        break;
      case 'room3':
        if(user_room3.indexOf(data.username) == -1){
        user_room3.unshift(data.username);
        }
        userno = user_room3;
        break;
      case 'room4':
        if(user_room4.indexOf(data.username) == -1){
        user_room4.unshift(data.username);
        }
        userno = user_room4;
        break;
    }
    console.log(data.username+"===== join ======"+socket.room);
    console.log("userno.length--"+userno.length+"--");
    console.log("user_room1--"+user_room1.length+"--");
    socket.emit("adder",{adder:false,deler:false});
    socket.emit('updatechat',{username:data.username,room:data.room},userno);
    socket.broadcast.to(data.room).emit('updatechat',{username:data.username,room:data.room},userno);
   io.sockets.emit('update_userno',{no1:user_room1.length,no2:user_room2.length,no3:user_room3.length,no4:user_room4.length});
    in_room  = true;
  }
  );

socket.on('adduser_in',function(data){
  console.log('知道 ****************');
    var check_room = data.room;
    var userno = []; 
    socket.username = data.username;
    socket.room = data.room;
    usernames[data.username] = data.username;
    socket.join(data.room);
    switch(check_room){
      case 'room1':
        if(user_room1.indexOf(data.username) == -1){
        user_room1.unshift(data.username);
        }
        userno = user_room1;
        break;
      case 'room2':
        if(user_room2.indexOf(data.username) == -1){
        user_room2.unshift(data.username);
        }
        userno = user_room2;
        break;
      case 'room3':
        if(user_room3.indexOf(data.username) == -1){
        user_room3.unshift(data.username);
        }
        userno = user_room3;
        break;
      case 'room4':
        if(user_room4.indexOf(data.username) == -1){
        user_room4.unshift(data.username);
        }
        userno = user_room4;
        break;
    }
    console.log(data.username+"===== join ======"+socket.room);
    console.log("userno.length--"+userno.length+"--");
    console.log("user_room1--"+user_room1.length+"--");
    //socket.emit("adder",{adder:false,deler:false});
    socket.emit('updatechat',{username:data.username,room:data.room},userno);
    socket.broadcast.to(data.room).emit('updatechat',{username:data.username,room:data.room},userno);
    io.sockets.emit('update_userno',{no1:user_room1.length,no2:user_room2.length,no3:user_room3.length,no4:user_room4.length});
    in_room  = true;
  }
  );

  //有人发话
  socket.on('say',function(data){
   console.log("房间:"+socket.room+"用户:"+socket.username+"&"+data.from+"===>"+data.to+"说："+data.msg);
    if(data.to == 'all'){
    //向其他所有用户广播该用户发话信息
    socket.broadcast.to(socket.room).emit('say',data);
    } else {
    //向特定用户发送该用户发话信息
    //clients 为存储所有连接对象的数组
    //var clients = io.sockets.clients();
    var clients = io.sockets.clients(socket.room);
    //遍历找到该用户
    clients.forEach(function(client){
      console.log("client in "+socket.room+"===="+client);
      if(client.username == data.to){
      //触发该用户客户端的 say 事件
      client.emit('say',data);
      }
    });
    }
  });
  //user离开对应的房间
  socket.on('deluser',function(data){
    var check_room = socket.room;
    var userno = []; 
    switch(check_room){
      case 'room1':
        user_room1.splice(user_room1.indexOf(socket.username),1);
        userno = user_room1;
        break;
      case 'room2':
        user_room2.splice(user_room2.indexOf(socket.username),1);
        userno = user_room2;
        break;
      case 'room3':
        user_room3.splice(user_room3.indexOf(socket.username),1);
        userno = user_room3;
        break;
      case 'room4':
        user_room4.splice(user_room4.indexOf(socket.username),1);
        userno = user_room4;
        break;
    }
    io.sockets.emit('update_userno',{no1:user_room1.length,no2:user_room2.length,no3:user_room3.length,no4:user_room4.length});
    console.log("usename="+data.username+"-----"+"scoket.username="+socket.username);
    console.log(socket.username+"---"+data.username+"离开了---"+socket.room);
    socket.leave(socket.room);
    socket.emit("deler",{adder:false,deler:false});
    socket.broadcast.to(socket.room).emit('leftroom',data.username,userno);
    
    out_room = true;
  });

socket.on('deluser_out',function(data){
    var check_room = socket.room;
    var userno = []; 
    switch(check_room){
      case 'room1':
        user_room1.splice(user_room1.indexOf(socket.username),1);
        userno = user_room1;
        break;
      case 'room2':
        user_room2.splice(user_room2.indexOf(socket.username),1);
        userno = user_room2;
        break;
      case 'room3':
        user_room3.splice(user_room3.indexOf(socket.username),1);
        userno = user_room3;
        break;
      case 'room4':
        user_room4.splice(user_room4.indexOf(socket.username),1);
        userno = user_room4;
        break;
    }
    
    console.log("usename="+data.username+"-----"+"scoket.username="+socket.username);
    console.log(socket.username+"---"+data.username+"离开了---"+socket.room);
    socket.leave(socket.room);
    socket.emit("deler",{adder:false,deler:false});
    socket.broadcast.to(socket.room).emit('leftroom',data.username,userno);
     io.sockets.emit('update_userno',{no1:user_room1.length,no2:user_room2.length,no3:user_room3.length,no4:user_room4.length});
    out_room = true;
  });
  
  socket.on('disconnect',function(){
    console.log("UUUUUUUU=usename="+socket.username);
     var check_room = socket.room;
     var userno = []; 
     switch(check_room){
      case 'room1':
        user_room1.splice(user_room1.indexOf(socket.username),1);
        userno = user_room1;
        break;
      case 'room2':
        user_room2.splice(user_room2.indexOf(socket.username),1);
        userno = user_room2;
        break;
      case 'room3':
        user_room3.splice(user_room3.indexOf(socket.username),1);
        userno = user_room3;
        break;
      case 'room4':
        user_room4.splice(user_room4.indexOf(socket.username),1);
        userno = user_room4;
        break;
    }
    console.log(socket.username+"---关闭浏览器离开了---"+socket.room);
    socket.leave(socket.room);
    console.log("##############");
    socket.broadcast.to(socket.room).emit('leftroom',socket.username,userno);
    socket.broadcast.emit('update_userno',{no1:user_room1.length,no2:user_room2.length,no3:user_room3.length,no4:user_room4.length});
  });
   console.log("=======================================");

});



server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
