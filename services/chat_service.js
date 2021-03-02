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
	        var selectRoomCode = new Promise(function (resolve, reject) {
	        	
	        	//임의 룸코드 생성_테스트(상품아이디와 상대, 자신 아이디로 방이 있는지 확인하면될듯?)
	        	if(param.roomId != '' && param.roomId!==undefined){
	        		resolve(param.roomId);
	        	}else{
		        	var roomId = generateUUID();
		        	resolve(roomId);
	        	}
/*                    //룸코드 찾기
                    dao.selectChatRoom(ids).then(function (data) {
                        if(data.length > 0 && data[0].room){
                            resolve(data[0].room);
                        } else {
                            //룸코드 생성
                            var roomId = generateUUID();
                            dao.insertRoomCode(roomId,ids).then(function (data) {
                                if(data){
                                    resolve(roomId);
                                } else {
                                    reject({err:'insertRoomCode Err'})
                                }
                            }).catch(function (err) {
                                reject({err:'insertRoomCode Err',err_info:err});
                            });
                        }
                    });*/
                
	        });

	        return new Promise(function (resolve, reject) {
	            selectRoomCode.then(function(roomId){
	                //해당 룸 코드에 있는 사람들 정보
	            	

	                var selectMessage = new Promise(function (resolve, reject) {
	                    
	                
	                	//이전메시지 가져오기 _테스트
	                	resolve([{'messageType':'me','text':'안녕하세요', 'time' : '2021.02.28 12:10:24'},{'messageType':'other','text':'네 안녕하세용', 'time' : '2021.02.28 12:12:24'}, {'messageType':'me','text':'반가워용', 'time' : '2021.02.28 13:10:24'}]);
	                	
	                	/*//해당 방의 모든 메시지 읽음 처리
	                    dao.updateMessageReadFlag(roomId,param.me).then(function (read_meg_list) {
	                        //해당 롬 코드에 있는 메시지 20개
	                        dao.selectMessageLimit20(roomId,param.me).then(function (message_list) {
	                            resolve({
	                                read_meg_list:read_meg_list,//자신이 읽음 처리한 메시지 리스트 [{num,flag},....]
	                                message_list:message_list
	                            });
	                        }).catch(function (err) {
	                            console.log('selectMessageLimit20 ERR',err);
	                            reject(err);
	                        });
	                    }).catch(function (err) {
	                        console.log('updateMessageReadFlag ERR',err);
	                        reject(err);
	                    });*/
	                });

	                //최종 결과
	                selectMessage.then(function(res){
	                    resolve({
	                        roomId:roomId, //위 selectRoomCode에서 받아옴
	                        message_list:res
	                    });
	                }).catch(function(err){
	                    console.log('selectUser,selectMessage ERR',err);
	                    reject(err);
	                });
	            }).catch(function (err) {
	                console.log('selectRoomCode ERR',err);
	                reject(err);
	            });
	        });
	    },
	    
	    //메시지 저장
	    insertMessage : function (param) {
	    	console.log('방번호 : '+param.roomId+' 아이디 : '+param.userId+' 메시지 : '+param.message+' 시간 : '+param.time+'[success insert]');
	    	return dao.insertMessage(param.roomId,param.userId,param.message,param.time);
	    	
	    	
	    } ,
	    //방나가기(나간 사용자는 나간 시점 이전의 메시지를 확인 할 수 없음)
	    leaveRoom : function (param) {
	    	console.log('방번호 : '+param.roomId+' 아이디 : '+param.userId+' 시간 : '+param.time+'[success leave]');
	    	
	    	//룸 테이블의 endMessageNum에 가장마지막 message테이블 번호를 저장하여 다시 채팅을 시작했을때 이전 메시지가 안보이도록 설정 
	    	return dao.updateLeaveRoom(param.roomId,param.userId,param.time);
	    	
	    	
	    }
}