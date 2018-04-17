/**
 * Created by peihengyang on 15/7/20.
 */
var admimProvider = require('../../data_provider/dao_provider/membership/admin');
var path = require('path');
var fs1 = require('fs');
var xlsx = require('node-xlsx');
var body = {
    title : '后台登录',
    message : null
};
exports.index = function(request, response){
    body.message = null;
    response.render('login', body);
};

exports.test1010 = function(req,res){
    body.message = null;
    var route = 'Check/checkPacket';
    body.message = null;
    var method = req.method;

    var BIModel ;
    console.log(method);
    var results = {};
    if(method === 'POST'){
        var File = req.files.Resource_File;
        var filename = req.body.Resource_Type +'_'+ (File.name || path.basename(File.path));
        console.log('files:',filename);
        var obj = xlsx.parse(fs.createReadStream(File.path));
        console.log(JSON.stringify(obj));
    }
    else
    {
        res.render(route, body);
    }
};

exports.login = function(req, res){
    var name = req.body.name;
    var pass = req.body.password;

    if(name && pass){
        admimProvider.getAdminByName(name, function(error, result){
            if(error){
                console.log(error);
                body.message = '登录失败.';
                return res.render('login',body);
            }
            if(!result || result.password !== pass){
                body.message = '帐号或密码错误.';
                return res.render('login',body);
            }
            req.session.user = result;
            res.redirect('/');
        });
    }
    else{
        body.message = '请输入帐号或密码.';
        return res.render('login',body);
    }
};

exports.logout = function(req, res){
    req.session.user = null;
    res.redirect('/login');
};