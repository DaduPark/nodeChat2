/**
 * Created by koreatkdtn on 2021.02.26
 * 채팅 서비스 로직
 */

var Promise = require("bluebird");


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
	        	
	        	console.log('0');
	        	//임의 룸코드 생성_테스트
	        	if(param.room_code != '' && param.room_code!==undefined){
	        		console.log('1');
	        		resolve(param.room_code);
	        	}else{
	        		console.log('2');
		        	var room_code = generateUUID();
		        	resolve(room_code);
	        	}
/*                    //룸코드 찾기
                    dao.selectChatRoom(ids).then(function (data) {
                        if(data.length > 0 && data[0].room){
                            resolve(data[0].room);
                        } else {
                            //룸코드 생성
                            var room_code = generateUUID();
                            dao.insertRoomCode(room_code,ids).then(function (data) {
                                if(data){
                                    resolve(room_code);
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
	            selectRoomCode.then(function(room_code){
	                //해당 룸 코드에 있는 사람들 정보
	            	

	                var selectMessage = new Promise(function (resolve, reject) {
	                    
	                
	                	//이전메시지 가져오기 _테스트
	                	resolve([{'name':'다두','text':'안녕하세요'},{'name':'나연','text':'네 안녕하세요'}]);
	                	
	                	/*//해당 방의 모든 메시지 읽음 처리
	                    dao.updateMessageReadFlag(room_code,param.me).then(function (read_meg_list) {
	                        //해당 롬 코드에 있는 메시지 20개
	                        dao.selectMessageLimit20(room_code,param.me).then(function (message_list) {
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
	                    console.log('message_list',res);
	                    resolve({
	                        room_code:room_code, //위 selectRoomCode에서 받아옴
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
	    }
}