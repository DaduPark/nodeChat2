var socket = io()

/*파라미터값 가져오기*/
function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex
			.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g,
			" "));
}

/*서버 에러 발생시 처리*/
function serverFail(point,errorMsg){
	
	console.log(point+'에서 에러발생 : '+errorMsg)
}

var paramRoomId = getParameterByName('roomId');
var paramRoomUserId = getParameterByName('userId');

/* 접속 되었을 때 실행 */
socket.on('connect', function() {

	/* 서버에 새로운 유저가 왔다고 알림 */
	socket.emit('join', {
		userId : paramRoomUserId,
		roomId : paramRoomId
	}, function(errorMsg){
		//실패시 처리
		if(errorMsg){
			serverFail('join', errorMsg);
		}
	});

})

/* 서버로부터 데이터 받은 경우 */
socket.on('setMessageList', function(data) {
	data.message_list.forEach(function(messageData){
		console.log(messageData.messageType);
	
		var chat = document.getElementById('chat')
	
		var message = document.createElement('div')
		var node = document.createTextNode(`${messageData.text} (${messageData.time})`)
		var className = ''
	
		// 타입에 따라 적용할 클래스를 다르게 지정
		switch (messageData.messageType) {
		case 'other':
			className = 'other'
			break
	
		case 'me':
			className = 'me'
			break
	
		}
	
		message.classList.add(className)
		message.appendChild(node)
		chat.appendChild(message)
	
	});
})

/* 서버로부터 데이터 받은 경우 */
socket.on('update', function(data) {
	var chat = document.getElementById('chat')

	var message = document.createElement('div')
	var node = document
			.createTextNode(`${data.userId}: ${data.message} (${data.time})`)
	var className = ''

	// 타입에 따라 적용할 클래스를 다르게 지정
	switch (data.type) {
	case 'message':
		className = 'other'
		break

	case 'connect':
		className = 'connect'
		node = document.createTextNode(`${data.userId}: ${data.message}`)
		break

	case 'disconnect':
		className = 'disconnect'
		break
	}

	message.classList.add(className)
	message.appendChild(node)
	chat.appendChild(message)
})

/* 메시지 전송 함수 */
function send() {
	// 입력되어있는 데이터 가져오기
	var message = document.getElementById('test').value

	// 가져왔으니 데이터 빈칸으로 변경
	document.getElementById('test').value = ''

	// 내가 전송할 메시지 클라이언트에게 표시
	var chat = document.getElementById('chat')
	var msg = document.createElement('div')
	var node = document.createTextNode(message)
	msg.classList.add('me')
	msg.appendChild(node)
	

	// 서버로 message 이벤트 전달 + 데이터와 함께
	socket.emit('sendMessage', {
		type : 'message',
		message : message
	}, function(errorMsg){
		//실패시 처리
		if(errorMsg=='fail'){
			serverFail('sendMessage', errorMsg);
		}else{
			//성공시 자신이 보낸 메시지 표시
			chat.appendChild(msg);
		}
	})
}

/* 나가기버튼 클릭 */
function leave() {

	// 서버로 message 이벤트 전달 + 데이터와 함께
	socket.emit('leaveRoom')
	self.close();// 닫는 액션취하기(앱에 다른화면 연결등)
}