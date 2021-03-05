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

/*환경설정*/
require("dotenv").config({ path: process.env.NODE_ENV == "prd" ? ".env" : ".env.dev"})

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
	socket.on('join', function(param, fn){
		
		
	    chat_service.joinCheck(param).then(function (data) {
	    	util.log('방번호 : '+param.roomId +'	'+__dirname)
	    	//console.log(data.message_list)
	    	
	    	/*소켓에 이름, 방 저장해두기*/
	    	socket.userId= param.userId;
	    	socket.roomId= param.roomId;
	    	socket.otherId= param.otherId;
	    	socket.userType= param.userType;
	    	socket.buyDate= param.buyDate;
	    	socket.check= param.buyDate;
	    	socket.messageExistCheck=data.messageExistCheck;
	    	
	    	util.log('메시지존재확인 1 : '+socket.messageExistCheck+'	'+__dirname);
	    	
	    	//util.log('소켓아이디 : '+socket.id+'	'+__dirname);
	    	
	    	socket.emit('setMessageList', data);
	    	
	    	socket.join(data.roomId);
	    }).catch(function (err) {
            console.log('joinERr',err);
            fn('fail');
        });
    
		/*모든 소켓에게 전송*/
		//io.sockets.in(data.room).emit('update', {type:'connect', name:'SERVER', message: data.userId+'님이 접속하였습니다.'})
	})
	
	
	socket.on('sendMessage', function(data, fn){
		/*받은 데이터에 누가 보냈는지 이름을 추가*/
		data.userId=socket.userId;
		data.otherId=socket.otherId;
		data.time = moment().format("YYYYMMDDHHmmssSSS");
		data.roomId=socket.roomId;
		data.messageExistCheck=socket.messageExistCheck;
		data.userType=socket.userType;
		
		console.log(data);
		
		/*보낸 사람을 제외한 나머지 유저에게 메시지 전송*/
		chat_service.insertMessage(data).then(function (messageNum) {
			socket.broadcast.to(socket.roomId).emit('update', data);
			console.log(messageNum+"return test");
			fn(messageNum);
			
			//메시지 전송후 항상 1로 두어 메시지가 있을때 방이 생성되지않게 설정
			socket.messageExistCheck=1;
			
		 }).catch(function (err) {
	            console.log('send_message ERR',err);
	            fn('fail');
	     });
	})
	
	socket.on('leaveRoom', function(){
		console.log(socket.userId + '님이 나가셨습니다.(나가기버튼)')
		
		/*보낸 사람을 제외한 나머지 유저에게 메시지 전송*/
		data.userId=socket.userId;
		data.time = moment().format();
		data.roomId=socket.roomId;
		chat_service.leaveRoom(data).then(function (messageNum) {
            
			fn('success');
            socket.leave(socket.roomId);
            
        }).catch(function (err) {
            console.log('leave_room ERR',err);
            fn('fail');
        });
		
		//socket.broadcast.to(socket.roomId).emit('update', {type:'disconnect', userId:'SERVER', message:socket.userId+'님이 나가셨습니다.'})
		
		
	})
	
	socket.on('disconnect', function(){
		
		console.log('그냥 창닫음')
		socket.leave(socket.roomId)
		/*나가는 사람을 제외한 나머지 유저에게 메시지 전송*/
		//socket.broadcast.to(socket.roomId).emit('update', {type:'disconnect', name:'SERVER', message:socket.name+'님이 나가셨습니다.'})
	})
})

