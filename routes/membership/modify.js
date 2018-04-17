/**
 * Created by peihengyang on 15/7/20.
 */

var adminProvider = require('../../data_provider/dao_provider/membership/admin');

var body = {
    title : '密码修改',
    message : null
};

exports.index = function(req, res){
    body.message = null;
    var route = 'account/modify';
    body.user = req.session.user;

    var method = req.method;

    if(method === 'POST'){
        var old_password = req.body.opassword;
        var new_password = req.body.npassword;


        if(old_password == '')
            return render(res, route, '请输入原始密码.');

        if(new_password == '')
            return render(res, route, '请输入新密码.');

        var name = req.session.user.name;

        adminProvider.getAdminByName(name, function(error, result){
            if(error)
                return render(res, route, '密码修改失败.');

            if(!result)
                return render(res, route, '登录超时，请重新登录.');

            if(result.password !== old_password)
                return render(res, route, '原始密码错误.');

            adminProvider.updatePassword(name, new_password, function(error, result){
                if(error)
                    return render(res, route, '密码修改失败.');

                return render(res, route, '密码修改成功.');
            });
        });
    }
    else
        res.render(route, body);
};

function render(res, route, message){
    body.message = message;
    console.log(body.message)
    res.render(route, body);
};