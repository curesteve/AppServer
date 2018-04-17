/**
 * Created by peihengyang on 15/6/11.
 */

var code = require('../../../config/code');
var sqlClient = require('../../dao/sqlClient').WxServer;
var sqlCommand = require('../../dao/sqlCommand');
var logger = require('log4js').getLogger("db");
var resource = module.exports;

resource.getAll = function (callback) {
    var sql = new sqlCommand('SELECT * FROM (SELECT * FROM manage_Tools_resource WHERE Enable = 1 ' +
    ') AS resource_Ordered ORDER BY Create_Date DESC');
    sqlClient.query(sql, function(error, results){
        if(error){
            console.log(error);
            callback(code.DB.EXEC_QUERY_ERROR, null);
        }
        else{
            callback(null,results);
        }
    })
};

resource.add = function (model,callback) {
    var sql = new sqlCommand('EXEC Wx_BindingUser ?,?,?',[model.userId,model.openId,model.nickName]);
    sqlClient.query(sql, function(error, results){
        //console.log('DB error:',sql);
        if(error){
            console.log(error);
            callback(code.DB.EXEC_QUERY_ERROR, null);
        }
        else{
            callback(null,results);
        }
    })
};

resource.del = function (model,callback) {
    var sql = new sqlCommand('EXEC Wx_UnbindingUser ?,?',[model.userId,model.openId]);
    sqlClient.query(sql, function(error, results){
        console.log('DB error:',sql);
        if(error){
            console.log(error);
            callback(code.DB.EXEC_QUERY_ERROR, null);
        }
        else{
            callback(null,results);
        }
    })
};

resource.getUserByOpenId = function (model,callback) {
    var sql = new sqlCommand('EXEC Wx_GetUserByOpenId ?',[model.openId]);
    sqlClient.query(sql, function(error, results){
        //console.log('DB error:',sql);
        if(error){
            console.log(error);
            callback(code.DB.EXEC_QUERY_ERROR, null);
        }
        else{
            console.log('wxUsers:',results);
            callback(null,results);
        }
    })
};

resource.getResourceById = function (resource_Id,callback) {
    var sql = new sqlCommand('SELECT * FROM manage_Tools_resource WHERE Enable = 1 ' +
    ' AND Resource_Id = ? ',[resource_Id]);
    sqlClient.query(sql, function(error, results){
        if(error){
            console.log(error);
            callback(code.DB.EXEC_QUERY_ERROR, null);
        }
        else{
            callback(null,results);
        }
    })
};


resource.deleteResource = function (resource_Tag,callback) {
    var sql = new sqlCommand('UPDATE manage_Tools_resource SET Enable = 0 WHERE Resource_Tag = ?',
        [resource_Tag]);
    sqlClient.query(sql, function(error, results){
        if(error){
            console.log(error);
            callback(code.DB.UPDATE_DATA_ERROR, null);
        }
        else{
            callback(null,results);
        }
    })
};
