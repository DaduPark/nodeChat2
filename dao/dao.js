var Promise = require("bluebird");
//var mysql = require('mysql');
//var credential = require('../private/credentials').mysql.production;

/*var db = mysql.createPool({
    host                : credential.host,
    port                : credential.port,
    user                : credential.user,
    password            : credential.password,
    database            : credential.database,
    connectionLimit     : credential.connectionLimit,
    waitForConnections  : credential.waitForConnections,
    multipleStatements  : true,
    timezone: 'KST'
});*/

module.exports = {

		//메시지 입력
	    insertMessage : function (roomId,userId,message,time) {
	        return new Promise(function (resolve, reject) {
	        	
	        	//테스트로 임의의 숫자 발생하게 만듦(메시지 고유 번호 대체)
	        	 resolve(Math.floor(Math.random() * 100));
	           /* db.getConnection(function(err, connection) {
	                connection.query('INSERT INTO message (sender,room,message,flag) VALUES(?,?,?,?);',[sender,room_code,message,flag], function(err, rows) {
	                    if(err){
	                        connection.release();
	                        reject(err);
	                    } else {
	                        connection.query('select LAST_INSERT_ID() as message_num;',function (err,message_num) {
	                            connection.release();
	                            if(err){
	                                reject(err);
	                            } else {
	                                resolve(message_num[0].message_num);
	                            }
	                        });
	                    }
	                });

	                if(err){
	                    connection.release();
	                    reject(err);
	                }
	            });*/
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
	    }
	    

}