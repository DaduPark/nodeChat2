var Promise = require("bluebird");

var mysql = require('mysql');

/*환경설정*/
require("dotenv").config({ path: process.env.NODE_ENV == "prd" ? ".env" : ".env.dev"})

var db = mysql.createPool({
    host                : process.env.HOST,
    port                : process.env.PORT,
    user                : process.env.USER,
    password            : process.env.PASSWORD,
    database            : process.env.DB_NAME,
    connectionLimit     : 50, /*최대 커넥션 개수, 기본 10개*/
    waitForConnections  : false, /*풀에 여유커넥션이 없는경우 대기 여부*/
    multipleStatements  : true
    /*,timezone: 'KST*/
    });

module.exports = {

		//메시지 입력
	    insertMessage : function (param) {
	        return new Promise(function (resolve, reject) {
	        	 db.getConnection(function(err, connection) {
	        		 if(err){
	        			 connection.release();
                         reject(err);
	        		 }else {
	        			 connection.release();
		        		 connection.query('INSERT INTO gppl_chatmessage (MESSAGE_NUM,ROOM_NUM,USER_ID,MESSAGE_TEXT) VALUES(?,?,?,?);',[param.time,param.roomId,param.userId,param.message], function(err, rows) {
		                    if(err){
		                    	//두사용자가 같은 시간에 채팅을 하여 milliseconds까지 겹칠경우 밀리세컨즈+1하여 한번더 insert 시도
		                    	connection.query('INSERT INTO gppl_chatmessage (MESSAGE_NUM,ROOM_NUM,USER_ID,MESSAGE_TEXT) VALUES(?,?,?,?);',[parseInt(param.time)+1,param.roomId,param.userId,param.message], function(err, rows) {
		                    		if(err){
				                        reject(err);
		                    		}else{
		                    			resolve(true);
		                    		}
		                    	});
		                        
		                    } else {
		                    	resolve(true);
		                    }
		                });
                     }
	            });
	        });
	    }, 
	    
	  //방 생성(방생성시 구매자방과 판매자 방 두개 생성)
	    insertChatRoom : function (param) {
	    	return new Promise(function (resolve, reject) {
	    		
	    		var buyerId = param.userType=='1' ? param.userId : param.otherId;
	    		var sellerId = param.userType=='1' ? param.otherId : param.userId;
	    		
		    	var insertBuyerChatRoom = new Promise(function (resolve, reject) {
		    		 db.getConnection(function(err, connection) {
		        		 if(err){
		        			 connection.release();
	                         reject(err);
		        		 }else {
		        			 connection.release();
			        		 connection.query('INSERT INTO gppl_chatroom (ROOM_NUM,USER_TYPE,USER_ID) VALUES(?,?,?);',[param.roomId,'1',buyerId], function(err, rows) {
			                    if(err){
			                    	reject(err);
			                    } else {
			                    	resolve(true);
			                    }
			                });
	                     }
		            });
		    	});
		    	
		    	
		    	var insertSellerChatRoom = new Promise(function (resolve, reject) {
		    		db.getConnection(function(err, connection) {
		        		 if(err){
		        			 connection.release();
	                         reject(err);
		        		 }else {
		        			 connection.release();
			        		 connection.query('INSERT INTO gppl_chatroom (ROOM_NUM,USER_TYPE,USER_ID) VALUES(?,?,?);',[param.roomId,'2',sellerId], function(err, rows) {
			                    if(err){
			                    	reject(err);
			                    } else {
			                    	resolve(true);
			                    }
			                });
	                     }
		            });
		    	});
		    	
		    	//최종 결과
	            Promise.all([insertBuyerChatRoom,insertSellerChatRoom]).then(function(res){
	                resolve({
	                    buyerRoom:res[0], 
	                    sellerRoom:res[1]
	                });
	            }).catch(function(err){
	                console.log('insertBuyerChatRoom,insertSellerChatRoom ERR',err);
	                reject(err);
	            });
	    	});
	    }, 
	  //방 나가기
	    deleteRoom : function (room_code,id) {
	        return new Promise(function (resolve, reject) {
	            db.getConnection(function(err, connection) {
	                /*connection.query( "DELETE FROM group_chat WHERE room = ? AND id = ?", [room_code,id],function(err, rows) {
	                    connection.release();
	                    if(err){
	                        reject(err);
	                    } else {
	                        resolve(true);
	                    }
	                });

	                if(err){
	                    connection.release();
	                    reject(err);
	                }*/
	            });
	        });
	    },
	    
	  //메시지가 있는지 확인(첫 메시지 발송시 방 생성 & 구매 확정보류 클릭시 메시지 유무 확인용)_ 방 개수 확인(메시지 생성시 방이 생기므로 방생성유무==메시지존재유무)
	    selectMessageExistCheck : function (roomId) {
	        return new Promise(function (resolve, reject) {
	            db.getConnection(function(err, connection) {
	            	
	            	if(err){
	                    connection.release();
	                    reject(err);
	                }
	            	
	                connection.query( "SELECT COUNT(*) as roomCount FROM gppl_chatroom WHERE room_num=?", [roomId],function(err, result) {
	                    connection.release();
	                    if(err){
	                        reject(err);
	                    } else {
	                        resolve(result[0].roomCount);
	                    }
	                });

	                
	            });
	        });
	    },
	    //이전메시지 가져오기
	    selectMessage : function (param) {
	        return new Promise(function (resolve, reject) {
	            db.getConnection(function(err, connection) {
	            	
	            	if(err){
	                    connection.release();
	                    reject(err);
	                }
	            	
	                connection.query( "SELECT M.Message_text AS text, message_num AS time,CASE when M.USER_ID=?  then 'me' ELSE 'other' END AS messageType   FROM gppl_chatmessage M INNER JOIN gppl_chatroom R ON M.room_num = R.room_num where R.USER_ID=? and M.ROOM_NUM=?  AND R.END_MESSAGE_NUM < M.Message_num order BY message_num ASC", [param.userId, param.userId, param.roomId],function(err, rows) {
	                    connection.release();
	                    if(err){
	                        reject(err);
	                    } else {
	                    	console.log(rows);
	                        resolve(rows);
	                    }
	                });

	                
	            });
	        });
	    }
	    
	    
	    

}