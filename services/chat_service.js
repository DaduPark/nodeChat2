/**
 * Created by koreatkdtn on 2021.02.26
 * 채팅 서비스 로직
 */

var Promise = require("bluebird");
var dao = require('../dao/dao.js');

//룸코드 생성
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};


module.exports = {
		
		joinCheck: function (param) {
	        return new Promise(function (resolve, reject) {
	        	
	        	
	        	//파라미터 체크
	        	if(param.roomId != '' && param.roomId!==undefined &&
	        	   param.userId != '' && param.userId!==undefined &&
	        	   param.otherId != '' && param.otherId!==undefined &&
	        	   param.userType != '' && param.userType!==undefined &&
	        	   param.buyDate != '' && param.buyDate!==undefined){
	        		//nothing
	        	}else{
	        		reject({err:'parameter undefined'});
	        	}
	        	
	        	//메시지가 있는지 확인(첫 메시지 발송시 방 생성 & 구매 확정보류 클릭시 메시지 유무 확인용)_ 방 개수 확인(메시지 생성시 방이 생기므로 방생성유무==메시지존재유무)
	    	    var selectMessageExistCheck = dao.selectMessageExistCheck(param.roomId);

                var selectMessage = dao.selectMessage(param);

                //최종 결과
                Promise.all([selectMessageExistCheck,selectMessage]).then(function(res){
                    resolve({
                        roomId:param.roomId, 
                        messageExistCheck:res[0],
                        messageList:res[1]
                    });
                }).catch(function(err){
                    console.log('selectMessageExistCheck,selectMessage ERR',err);
                    reject(err);
                });

	        });
	    },
	    
	    
	    //메시지 저장
	    insertMessage : function (param) {
	    	
	    	return new Promise(function (resolve, reject) {
	    		//첫 메시지 전송시 방생성 후 메시지 전송
		    	if(param.messageExistCheck=='0'){
		    		dao.insertChatRoom(param).then(function (data) {
		    			resolve(dao.insertMessage(param));
		    		}).catch(function (err) {
			            console.log('insertChatRoom ERR',err);
			            reject(err);
		    		});
		    	}else{
		    		resolve(dao.insertMessage(param));
		    	}
	    		
	    	});
	    	
	    } ,
	    //방나가기(나간 사용자는 나간 시점 이전의 메시지를 확인 할 수 없음)
	    leaveRoom : function (param) {
	    	console.log('방번호 : '+param.roomId+' 아이디 : '+param.userId+' 시간 : '+param.time+'[success leave]');
	    	
	    	//룸 테이블의 endMessageNum에 가장마지막 message테이블 번호를 저장하여 다시 채팅을 시작했을때 이전 메시지가 안보이도록 설정 
	    	return dao.updateLeaveRoom(param.roomId,param.userId,param.time);
	    	
	    	
	    }
}