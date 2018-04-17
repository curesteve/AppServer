/**
 * Created by peihengyang on 15/7/20.
 */
var code = require('../../../config/code');
var sqlClient = require('../../dao/sqlClient').admin;
var sqlCommand = require('../../dao/sqlCommand');
var logger = require('log4js').getLogger("db");

var admin = module.exports;

admin.getAdminById = function(user_id, callback){
    sqlClient.query(self.selectQuery(user_id), function(error, results){
        if(error)
            callback(new Error(code.DB.SELECT_DATA_ERROR), code.DB.SELECT_DATA_ERROR);
        else {
            if(results.length > 0)
                callback(null, results[0]);
            else
                callback(null, null);
        }
    });
};

admin.getAdminByName = function(name, callback){
    var sql = new sqlCommand('SELECT * FROM membership_admin WHERE account=?',[name]);
    //var sql = new sqlCommand('SELECT * FROM test.dbo.test WHERE ID = ?',['1']);
    sqlClient.query(sql, function(error, results){
        if(error)
        {
            console.log(error);
            callback(new Error(code.DB.SELECT_DATA_ERROR), code.DB.SELECT_DATA_ERROR);
        }
        else {
            //console.log('results:',results[0].create_date.format('yyyy-MM-dd hh:mm:ss'));
            if(results.length > 0)
                callback(null, results[0]);
            else
                callback(null, null);
        }
    });
};

admin.updatePassword = function(name, password, callback){
    var sql = new sqlCommand('UPDATE membership_admin SET password=? WHERE account=?',[password, name]);
    sqlClient.update(sql, function(error, results){
        if(error)
            callback(new Error(code.DB.UPDATE_DATA_ERROR), code.DB.UPDATE_DATA_ERROR);
        else
            callback(null, null);
    });
};


admin.selectQuery = function(user_id){
    return new sqlCommand('SELECT * FROM membership_admin WHERE user_id=?',
        [user_id]);
};
