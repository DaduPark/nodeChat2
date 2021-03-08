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
		                    	//두 사용자가 같은 시간에 채팅을 하여 milliseconds까지 겹칠경우 밀리세컨즈+1하여 한번더 insert 시도
		                    	connection.query('INSERT INTO gppl_chatmessage (MESSAGE_NUM,ROOM_NUM,USER_ID,MESSAGE_TEXT) VALUES(?,?,?,?);',[(BigInt(param.time)+BigInt(1)),param.roomId,param.userId,param.message], function(err, rows) {
		                    		if(err){
				                        reject(err);
		                    		}else{
		                    			resolve((BingInt(param.time)+BingInt(1)));
		                    		}
		                    	});
		                        
		                    } else {
		                    	resolve(param.time);
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
			        		 connection.query('INSERT INTO gppl_chatroom (ROOM_NUM,USER_TYPE,USER_ID,SOLD_DATE) VALUES(?,?,?,?);',[param.roomId,'1',buyerId,param.soldDate], function(err, rows) {
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
			        		 connection.query('INSERT INTO gppl_chatroom (ROOM_NUM,USER_TYPE,USER_ID,SOLD_DATE) VALUES(?,?,?,?);',[param.roomId,'2',sellerId,param.soldDate], function(err, rows) {
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
	    
	  //구매일과 방존재유무 체크(기존 대화방없을시 0을 리턴하고 있을 시 상품구매일 반환)
	    selectSoldDateAndExistCheck : function (param) {
	        return new Promise(function (resolve, reject) {
	            db.getConnection(function(err, connection) {
	            	
	            	if(err){
	                    connection.release();
	                    reject(err);
	                }
	            	
	                connection.query( "SELECT case when COUNT(*)=0 then 0 ELSE sold_date END as soldDate FROM gppl_chatroom WHERE room_num=? AND USER_id=?", [param.roomId, param.userId],function(err, result) {
	                    connection.release();
	                    if(err){
	                        reject(err);
	                    } else {
	                        resolve(result[0].soldDate);
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
	    },
	  //가장 최근에 본 메시지 update(해당 방의 가장큰 메시지번호를 저장함)
	    updateViewMessage : function (param) {
	        return new Promise(function (resolve, reject) {
	            db.getConnection(function(err, connection) {
	            	
	            	if(err){
	                    connection.release();
	                    reject(err);
	                }
	            	
	                connection.query( "UPDATE gppl_chatroom SET VIEW_MESSAGE_NUM=(SELECT MAX(MESSAGE_NUM) FROM test.gppl_chatmessage) WHERE room_num=?  AND user_id=?", [param.roomId, param.userId],function(err, rows) {
	                    connection.release();
	                    if(err){
	                        reject(err);
	                    } else {
	                        resolve(rows);
	                    }
	                });

	                
	            });
	        });
	    }
	    
	    
	    

}