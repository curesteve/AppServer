/**
 * Created by peihengyang on 15/7/20.
 */

var async = require('async');
var logger = require('log4js').getLogger("db");
var code = require('../../config/code');
var connection = require('./connection');

var sqlExecute = module.exports;
var pools = [];

sqlExecute.init = function(pool_name, app){
    var find_pool = null;
    pools.forEach(function(item){
       if(item.pool_name === pool_name)
           find_pool = item;
    });

    if(!!find_pool)
        return find_pool.execute;
    else{
        var pool = new connection(pool_name, app);
        pool.init();

        var execute = {};
        execute.insert = pool.query;
        execute.update = pool.query;
        execute.delete = pool.query;
        execute.query = pool.query;
        execute.transaction = pool.transaction;

        execute.shutdown = function(){
            pool.shutdown();
        };

        pools.push({
            pool_name : pool_name,
            execute : execute
        });

        return execute;
    }
};