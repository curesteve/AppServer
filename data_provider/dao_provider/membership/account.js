/**
 * Created by peihengyang on 15/7/20.
 */
var code = require('../../../config/code');
var sqlClient = require('../../dao/sqlClient').membership;
var sqlCommand = require('../../dao/sqlCommand');
var logger = require('log4js').getLogger("db");

var account = module.exports;

account.getAccountById = function(membership_id, callback){
    var sql = new sqlCommand('SELECT * FROM membership.membership_users WHERE membership_id=?',[membership_id]);
    sqlClient.query(sql, function(error, results){
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

account.getAccountByName = function(name, callback){
    //var sql = new sqlCommand('SELECT * FROM membership.membership_users WHERE account=?',[name]);
    var sql = new sqlCommand('SELECT * FROM test.dbo.test');
    sqlClient.query(sql, function(error, results){
        if(error)
            callback(new Error(code.DB.SELECT_DATA_ERROR), code.DB.SELECT_DATA_ERROR);
        else {
            if(results.length > 0)
            {
                console.log('result:',results[0].create_date.format('yyyy-MM-dd hh:mm:ss'));
                callback(null, results[0]);
            }
            else
                callback(null, null);
        }
    });
};

account.validQuery = function(membership_id, is_valid){
    return new sqlCommand('UPDATE membership.membership_users SET IsValid=? WHERE membership_id=?',[is_valid,membership_id]);
};