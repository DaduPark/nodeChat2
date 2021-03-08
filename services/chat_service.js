/**
 * Created by koreatkdtn on 2021.02.26
 * 채팅 서비스 로직
 */

var Promise = require("bluebird");
var dao = require('../dao/dao.js');


module.exports = {
		
		joinCheck: function (param) {
	        return new Promise(function (resolve, reject) {
	        	
	        	
	        	//파라미터 체크
	        	if(param.roomId != '' && param.roomId!==undefined &&
	        	   param.userId != '' && param.userId!==undefined &&
	        	   param.otherId != '' && param.otherId!==undefined &&
	        	   param.userType != '' && param.userType!==undefined &&
	        	   param.soldDate != '' && param.soldDate!==undefined){
	        		//nothing
	        	}else{
	        		reject({err:'parameter undefined'});
	        	}
	        	
	        	//구매일과 방존재유무 체크(기존 대화방없을시 0을 리턴하고 있을 시 상품구매일 반환)
	    	    var selectSoldDateAndExistCheck = dao.selectSoldDateAndExistCheck(param);
	    	    
	    	    //이전 메시지
                var selectMessage = dao.selectMessage(param);

                //최종 결과
                Promise.all([selectSoldDateAndExistCheck,selectMessage]).then(function(res){
                    resolve({
                        roomId:param.roomId, 
                        soldDate:res[0],
                        messageList:res[1]
                    });
                }).catch(function(err){
                    console.log('selectSoldDateAndExistCheck,selectMessage ERR',err);
                    reject(err);
                });

	        });
	    },
	    
	    
	    //메시지 저장
	    insertMessage : function (param) {
	    	
	    	return new Promise(function (resolve, reject) {
	    		//첫 메시지 전송시 방생성 후 메시지 전송
		    	if(param.messageExistFlag=='0'){
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
	  //가장 최근에 본 메시지 update
	    updateViewMessage : function (param) {
	    	
	    	return dao.updateViewMessage(param);
	    	
	    }
}