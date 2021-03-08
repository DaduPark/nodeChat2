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
	    	socket.soldDate= param.soldDate;
	    	
	    	console.log('구입일 테스트'+data.soldDate);
	    	//기존 방 존재 시 soldDate는  DB값을 불러오며 메시지존재유무는 1로 설정
	    	if(data.soldDate=='0'){
	    		socket.messageExistFlag='0';//기존 메시지 존재 유무 설정(방이 존재하지 않으면 메시지도 존재하지 않음)
	    		socket.soldDate=param.soldDate;
	    	}else{
	    		socket.messageExistFlag='1';
	    		socket.soldDate=data.soldDate;
	    	}
	    	console.log('구입일 테스트(데이터) : '+socket.soldDate);
	    	
	    	util.log('메시지존재확인 1 : '+socket.messageExistFlag+'	'+__dirname);
	    	
	    	//util.log('소켓아이디 : '+socket.id+'	'+__dirname);
	    	
	    	socket.emit('setMessageList', data);
	    	
	    	fn(socket.soldDate);
	    	
	    	socket.join(data.roomId);
	    	
	    	//가장 최근에 본 메시지 update 
	    	chat_service.updateViewMessage(param);
	    	
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
		data.messageExistFlag=socket.messageExistFlag;
		data.userType=socket.userType;
		data.soldDate=socket.soldDate;
		
		console.log(data);
		
		/*보낸 사람을 제외한 나머지 유저에게 메시지 전송*/
		chat_service.insertMessage(data).then(function (messageNum) {
			
			//2명 동시에 메시지를 발송한 경우 time을 변경하였으므로 return 받은 시간을 다시 삽입 
			data.time = messageNum;
			
			socket.broadcast.to(socket.roomId).emit('update', data);
			fn(messageNum);
			//메시지 전송후 항상 1로 두어 메시지가 있을때 방이 생성되지않게 설정
			socket.messageExistFlag=1;
			
		 }).catch(function (err) {
	            console.log('send_message ERR',err);
	            fn('fail');
	     });
	})
	

	
	socket.on('disconnect', function(){
		
		//가장 최근에 본 메시지 update 
    	chat_service.updateViewMessage({
    		userId : socket.userId,
    		roomId : socket.roomId
    	});
		
		console.log('그냥 창닫음')
		socket.leave(socket.roomId)
		/*나가는 사람을 제외한 나머지 유저에게 메시지 전송*/
		//socket.broadcast.to(socket.roomId).emit('update', {type:'disconnect', name:'SERVER', message:socket.name+'님이 나가셨습니다.'})
	})
})

