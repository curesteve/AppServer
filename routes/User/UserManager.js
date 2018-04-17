/**
 * Created by peihengyang on 14/12/11.
 */
//var enums = require('../../data_provider/dao_provider/edit/enums');
//var date = require('../../util/date');
var editResourceProvider = require('../../data_provider/dao_provider/Check/resource');
var wxServerdbProvider = require('../../data_provider/dao_provider/Check/WxUserManage');
var getXmlString = require('../../util/stringUtil');
var netWork = require('../../util/netWork');
var code = require('../../config/code');
var dictionary = require("../../ZYGames/dictionary");
var crypto = require('crypto');
var path = require('path');
var url = require('url');
var util = require('util');
var fs = require('fs');
var xlsx = require('node-xlsx');
var xlstojson = require("xls-to-json");
var async = require('async');
var parseString = require('xml2js').parseString;
var json2xml = require('../../util/json_xml/json_xml');
var appid = 'wx88207d9a56c89c3d';
var secret = '44dc520b41f270482091b45ebebfa67c';
var body = {
    title : '用户管理',
    message : null,
    result:{userId:null,openId:null}
};

exports.index = function(req, res){
    body.message = null;
    editResourceProvider.getAll(function(error, results){
        //console.log('resultall:',results[0].create_date.format('yyyy-MM-dd hh:mm:ss'));
        body.results = results;
        res.render('WXUser/login', body);
    });
};

var checkZYUser = function (name,pass,callback) {

    var clientid = 1
    var secret = "acb25ec4cd884e44aa0cde9a9a3fdc88"

    var parameters = new dictionary()

    parameters.store("clientId",clientid);
    parameters.store("name",name);
    parameters.store("password",pass);

    var timestamp = Math.round(+new Date()/1000).toString();
    parameters.store("timestamp",timestamp);

    var nonce = clientid + timestamp;
    parameters.store("nonce",nonce);

    var signature = generatesignature(parameters, secret);
    parameters.store("signature",signature)

    var api = "/api/user/verify" + buildquerystring(parameters, true);

    console.log('api:',api);

    var options = {
        host: 'openapi.zygames.com',
        port: '88',
        method:'GET',
        path: api
    };
    netWork.Get(options.host,options.path,
        options.port,function (error,results) {
        console.log('zyUsererror:',error);
            if (error == code.OK){
                //var returnResult = JSON.parse(results);
                    //console.log('userResult:',returnResult);
                    callback(code.OK,results);

            }
            else
            {
                callback(error,null);
            }

        })
}

var getToken = function (callback) {
    var sendMsg = {};
    netWork.Get('api.weixin.qq.com','/cgi-bin/token?grant_type=client_credential&appid=' +
        appid + '&secret=' + secret,
        443,function (error,results) {
            console.log('error:',error);
            if (error == code.OK){
                var returnResult = JSON.parse(results);
                console.log('returnResult.access_token:',returnResult.access_token);
                callback(code.OK,returnResult.access_token);
            }
            else
            {
                callback(error,null);
            }
        })
}

exports.add =  function(req,res){
    body.message = null;
    var method = req.method;
    //console.log('files:',files);
    var route = 'WXUser/add';
    if(method === 'POST') {
        parseString( req.rawBody,function(err,result) {
           var wxUser = JSON.parse(JSON.stringify(result)).xml;
           var model = {};
           model.UserID = 00001;
           model.OpenId = getXmlString.getStringFromXml(wxUser.FromUserName);
           console.log(wxUser);
            wxServerdbProvider.add(model,function (error,results) {
                if (error != null){
                    console.log(error);
                    results = 'error';
                }
                else
                {
                    getToken(function (error,results) {
                        var sendMsg = JSON.stringify({
                            "touser":[
                                "orBAO1fEY4WkK2y4v6C3e88OzAdM",
                                "orBAO1SJVg73QiCgWioG-IBymXFQ"
                            ],
                            "msgtype": "text",
                            "text": { "content": "hello from boxer."}
                        });
                        var token = results;
                        netWork.Post('api.weixin.qq.com','/cgi-bin/message/mass/send?access_token=' +
                            token,
                            443,sendMsg,function (error,results) {
                                console.log('wxapi error:',error)
                                checkZYUser('curesteve','654321',function (error,result) {
                                    if(error!=null){
                                        console.log(error,result);
                                    }
                                    else
                                    {
                                        console.log(result);
                                    }
                                })
                            })
                    });
                   // res.render('login', body);
                    console.log('OK')
                }
            })
        });
        // res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
        // res.end();
        //res.render(route,body);
    }
    else{
         console.log('reqget:');
        // res.writeHead(200, {'Content-Type': 'text/plain'});
        // var params = url.parse(req.url,true).query;
        // console.log('params:',params);
    }
};

exports.login = function(req, res){
    var method = req.method;
    var route = 'User/zylogin';
    console.log(route);
    body.message = null;
    body.usercode = null;
    if(method === 'POST'){
        var name = req.body.name;
        var pass = req.body.password;
        var openId = req.body.opencode;
        console.log('name:',req.body);
        if(name && pass && openId){
            checkZYUser(name,pass,function (error,result) {
                if(error!=null){
                    //网络调用成功
                    //console.log('wxapi result:',result);
                    var zyUserResult = JSON.parse(result);
                    if(zyUserResult.Code == 0){
                        //API调用成功
                        var model = {
                            userId:zyUserResult.UserId,
                            openId:openId,
                            nickName:zyUserResult.NickName
                        }
                        wxServerdbProvider.add(model,function(error,result){
                            if(error == null){
                                body.message = '帐号绑定成功';
                                body.result = model;
                                return res.render('User/zylogin',body);
                            }
                            else
                            {
                                console.log(error);
                                body.message = '帐号绑定失败，请联系客服.';
                                return res.render('User/zylogin',body);
                            }
                        })
                    }
                    else
                    {
                        //API返回错误
                    }
                }
                else
                {
                    //网络调用失败
                    console.log(result);
                }
            })
            // getToken(function (error,result) {
            //     var sendMsg = JSON.stringify({
            //         "touser":[
            //             "orBAO1fEY4WkK2y4v6C3e88OzAdM",
            //             "orBAO1SJVg73QiCgWioG-IBymXFQ"
            //         ],
            //         "msgtype": "text",
            //         "text": { "content": "hello from boxer."}
            //     });
            //     var token = result;
            //
            // })
            // checkZYUser(name,pass,function (error,loginResult) {
            //     if(loginResult.Code != 0){
            //         console.log(error);
            //         body.message = '帐号或密码错误.';
            //         return res.render('User/zylogin',body);
            //     }
            //     else
            //     {
            //         console.log('loginResult:',loginResult);
            //         body.message = JSON.stringify(loginResult);
            //         return res.render('User/zylogin',body);
            //     }
            // });
        }
        else{
            body.message = '请输入帐号或密码.';
            return res.render('User/zylogin',body);
        }
    }else
    {
        var param = url.parse(req.url,true).query;
        var usercode = param.code;
        netWork.Get('api.weixin.qq.com','/sns/oauth2/access_token?appid=' +
            appid + '&secret=' + secret + '&code=' + usercode + '&grant_type=authorization_code',
            443,function (error,results) {
                console.log('wxapi result:',results);
                var openId = JSON.parse(results).openid;
                console.log('openId:',openId);
                body.usercode = openId;
                var model = {openId:openId};
                wxServerdbProvider.getUserByOpenId(model,function (error,result) {
                    if (error == null){
                        if(result.length >= 1)
                        {
                            body.message = '帐号已绑定：' + result[0].userid;
                            body.result = {
                                userId:result[0].userid,
                                openId:openId,
                                nickName:result[0].nickname
                            };
                            res.render(route, body);
                        }
                        else
                        {
                            res.render(route, body);
                        }
                    }
                    else
                    {
                        res.render(route, body);
                    }

                })
            });
    }
};


exports.del =  function(req,res){
    body.message = null;
    var method = req.method;
    var model = {
        openId:req.query.openid,
        userId:req.query.userid
    };
    var route = '/User/del';
    wxServerdbProvider.del(model,function(error,result){
        console.log('delresult:',result);
        if(error == null){
            body.message = '帐号解绑成功';
            model = {
                openId:null,
                userId:null
            };
            body.result = model;
            return res.render('User/zylogin',body);
        }
        else
        {
            console.log(error);
            body.message = '帐号绑定失败，请联系客服.';
            return res.render('User/zylogin',body);
        }
    })
};

exports.chk =  function(req,res){
    body.message = null;
    var method = req.method;
    var resourceId = req.query.id;
    var route = 'Check/chk';
    console.log(route);
    //if(method === 'POST') {
    editResourceProvider.getResourceById(resourceId,function(error,results){
        if(error!=null){
            console.log(error);
            body.message = '获取资源错误';
        }
        else
        {
            var excelfile = path.resolve(path.dirname(__filename) , '../../public') + results[0].resource_url;
            xlstojson({
                input:excelfile, // input xls
                output: "output.json" // output json
                //sheet: "sheet1", // specific sheetname
            }, function(err, result) {
                if(err) {
                    console.error(err);
                    body.message = err;
                } else {
                    var packetIds = '';
                    result.forEach(function(item){
                        if(packetIds.indexOf(item.PacketId) == -1){
                            packetIds += item.PacketId;
                            packetIds += ',';
                        }
                    });
                    packetIds += '0';
                        coupondbProvider.getCoupon_PacketByIds(packetIds,function(error,resultCoupon){
                            if(error){
                                console.log(error);
                                body.message = error;
                            }
                            else
                            {
                                var updateFun = [];
                                var resultFinal = [];
                                updateFun.push(
                                    function(){
                                        result.forEach(function(resultItem,indexresult){
                                            console.log('resultItem:',resultItem);

                                                resultCoupon.forEach(function(couponItem){
                                                    console.log('couponItem:',couponItem);
                                                    if(typeof(resultItem.checkState) == 'undefined'){
                                                    if(parseInt(resultItem.PacketId) == parseInt(couponItem.packetid) && parseInt(resultItem.itemId) == parseInt(couponItem.itemid)){
                                                        result[indexresult].checkState = 'OK';
                                                        console.log('OK:',result[indexresult]);
                                                        resultFinal.push(result[indexresult]);
                                                    }
                                                    }
                                                })
                                            if(typeof(resultItem.checkState) == 'undefined'){
                                                result[indexresult].checkState = 'Not Find';
                                                console.log('Not Find:',result[indexresult]);
                                                resultFinal.push(result[indexresult]);
                                            }

                                        })
                                        body.results = result;
                                        console.log(result);
                                        res.render(route,body);
                                    }
                                );
                                async.series(updateFun,function(error,results){
                                })
                            }
                        })
                }
                //res.render(route,body);
            });
            //console.log(JSON.stringify(excelfile));
        }
        //res.render(route,body);
    })
    //}
    //else{
    //    res.render(route, body);
    //}
};


function createResourceModel(req,file){
    var resourceModel = {
        Resource_Id : 0,
        Resource_Version:0,
        Resource_Tag:'',
        Resource_Url :'',
        Create_Date:0,
        Enable:0
    };
    resourceModel.Resource_Tag =  file.name;
    resourceModel.Resource_Url = '/resourceFile/'+ resourceModel.Resource_Tag;
    resourceModel.Create_Date  = new Date();
    resourceModel.Enable = 1;
    return resourceModel;
}


Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}



function generatesignature(parameters,secret)
{
    // 第一步：把字典按Key的字母顺序排序
    parameters = parameters.sort();

    // 第二步：把所有参数名和参数值串在一起(secret放在第一个)
    var query = secret;

    for(var key in parameters.keys) {
        var value = parameters.keys[key];
        if(value!="")
        {
            query = query+key+value;
        }
    }
    console.log(query);
    // 第三步：使用md5运算
    var signature = crypto.createHash('md5').update(query,'utf-8').digest("hex");
    return signature;
}


function buildquerystring(parameters,addquestionmark)
{
    if(parameters.length == 0)
    {
        return "";
    }
    var str = "";
    if(addquestionmark)
    {
        str = str+"?";
    }
    var hasmoreparameter = false;
    for(var key in parameters.keys) {
        if(hasmoreparameter)
        {
            str = str + "&";
        }
        str = str + key + "=" + parameters.keys[key]
        hasmoreparameter = true
    }
    return str;
}


//发送消息
/*
                    getToken(function (error,results) {
                        var sendMsg = JSON.stringify({
                            "touser":[
                                "orBAO1fEY4WkK2y4v6C3e88OzAdM",
                                "orBAO1SJVg73QiCgWioG-IBymXFQ"
                            ],
                            "msgtype": "text",
                            "text": { "content": "hello from boxer."}
                        });
                        var token = results;
                        netWork.Post('api.weixin.qq.com','/cgi-bin/message/mass/send?access_token=' +
                            token,
                            443,sendMsg,function (error,results) {
                            console.log('wxapi error:',error)
                                    checkZYUser('curesteve','654321',function (error,result) {
                                        if(error!=null){
                                            console.log(error,result);
                                        }
                                        else
                                        {
                                            console.log(result);
                                        }
                                    })
                            })
                    });
 */