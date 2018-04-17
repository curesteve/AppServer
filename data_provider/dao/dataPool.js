/**
 * Created by peihengyang on 15/7/20.
 */
var pool = require('generic-pool');
global.process
exports.createPool = function(pool_name, app){
    var config = require('../../config/mysql.json');
    var server_name = config[global.process.argv[2]][pool_name];
    var returnClient = null;
    if (server_name != undefined){
        switch(server_name.protocol){
            case 'mysql':
                console.log('mysql');
                returnClient = pool.Pool(
                    {
                        name: pool_name,
                        create: function(callback){
                            var mysql = require('mysql');
                            var client = mysql.createConnection(server_name);
                            callback(null, client);
                        },
                        destroy: function(client) {
                            client.end();
                        },
                        max: 10,
                        idleTimeoutMillis : 10,//与mysql服务器保持一致设置
                        log : false
                    }
                );
                break;
            case 'mssql':
                //console.log('mssql:',server_name);
                returnClient =  pool.Pool(
                    {
                        name: pool_name,
                        create: function(callback){
                            var mssql = require('node-mssql-connector');
                            var client = new mssql(
                                {
                                    settings: {
                                        max: 20,
                                        min: 0,
                                        idleTimeoutMillis: 30000,
                                        detailerror: true
                        },
                            connection: {
                                userName: server_name.user,
                                    password: server_name.password,
                                    server: server_name.host,
                                    options: {
                                    database: server_name.database
                                }
                            }
                        }
                            ) ; //mssql.createConnection(server_name);
                            callback(null, client);
                        },
                        destroy: function(client) {
                            client.end();
                        },
                        max: 10,
                        idleTimeoutMillis : 10,//与mysql服务器保持一致设置
                        log : false
                    }
                );
                break;
            default:
                break;
        }
        return returnClient;
    }


};