/*Node.js 기본 내장 모듈 불러오기*/
const fs = require('fs')

const  util = require('util'),
      bodyParser = require('body-parser');

/*설치한 express 모듈 불러오기*/
const express = require('express')

/*설치한 socket.io 모듈 불러오기*/
const socket = require('socket.io') 

/*Node.js 기본 내장 모듈 불러오기*/
const http = require('http')

var chat_service = require('./services/chat_service.js');

/*express 객체 생성*/
const app = express()

const CORS = require('cors')()

app.use(CORS);

/*현재 국가의 시간*/
var moment = require('moment-timezone') ;
moment.tz.setDefault("Asia/Seoul");

/*생성된 서버를 socket.io에 바인딩*/
const server = http.createServer(app)

const httpServer= server.listen(8090, function(req,res){
    console.log('Socket IO server has been started');
});

/*생성된 서버를 socket.io에 바인딩*/
const io = socket(server).listen(httpServer, {log:false, origins:'*:*'});

app.use('/css', express.static('./static/css')) 
app.use('/js', express.static('./static/js'))

/*get 방식으로 / 경로에 접속하면 실행됨*/
app.get('/chat', function(request, response){
	fs.readFile('./static/index.html', function(err, data){
		if(err){
			response.send('에러')
		}else{
			response.writeHead(200, {'Content-Type':'text/html'})
			response.write(data)
			response.end()
		}
	})
})


io.sockets.on('connection', function(socket){
	
	/*새로운 유저가 접속했을 경우 다른 소켓에게 알려줌*/
	socket.on('newUser', function(param){
		
		
	    chat_service.joinCheck(param).then(function (data) {
	    	util.log('방번호 : '+data.room_code +'	'+__dirname)
	    	//console.log(data.message_list)
	    	
	    	/*소켓에 이름, 방 저장해두기*/
	    	socket.name= param.userId
	    	socket.room= data.room_code;
	    	
	    	util.log('소켓아이디 : '+socket.id+'	'+__dirname);
	    	
	    	socket.emit('setMessageList', data);
	    	
	    	socket.join(data.room_code);
	    }).catch(function (err) {
            console.log('joinERr',err);
            fn('fail');
        });
    
		/*모든 소켓에게 전송*/
		//io.sockets.in(data.room).emit('update', {type:'connect', name:'SERVER', message: data.userId+'님이 접속하였습니다.'})
	})
	
	
	socket.on('message', function(data){
		/*받은 데이터에 누가 보냈는지 이름을 추가*/
		data.name=socket.name
		data.time = moment().format("h:ss A")
		console.log(data)
		
		/*보낸 사람을 제외한 나머지 유저에게 메시지 전송*/
		
		socket.broadcast.to(socket.room).emit('update', data)
	})
	
	socket.on('roomLeave', function(){
		console.log(socket.name + '님이 나가셨습니다.(나가기버튼)')
		/*보낸 사람을 제외한 나머지 유저에게 메시지 전송*/
		
		socket.broadcast.to(socket.room).emit('update', {type:'disconnect', name:'SERVER', message:socket.name+'님이 나가셨습니다.'})
		
		socket.leave(socket.room);
	})
	
	socket.on('disconnect', function(){
		
		console.log('그냥 창닫음')
		socket.leave(socket.room)
		/*나가는 사람을 제외한 나머지 유저에게 메시지 전송*/
		//socket.broadcast.to(socket.room).emit('update', {type:'disconnect', name:'SERVER', message:socket.name+'님이 나가셨습니다.'})
	})
})

