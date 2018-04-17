var https = require('https');
var http = require('http');
const querystring = require('querystring');
var code = require('../config/code');
var netWork = module.exports;
var Url = {
    host:'',
    path:'',
    params:{},
    method:''
}
netWork.Post = function (url,path,port,postParam,callback) {
    Url.host = url;
    Url.path = path;
    Url.method = 'POST';
    Url.port = 443;//port;
    Url.params = postParam;
    //console.log('postParam:',Url.params);
    send(Url,function (error,results) {
        if(error != code.OK){
            console.log(error);
            callback(error,null);
        }
        else
        {
            //console.log('results:',results);
            callback(error,results);
        }
    })
}

netWork.Get = function (url,path,port,callback) {
    Url.host = url;
    Url.path = path;
    Url.method = 'GET';
    Url.port = port;
    Url.params = querystring.stringify({});
    console.log('Url:',Url);
    send(Url,function (error,results) {
        if(error !=  200){
            console.log('error:',error);
            callback(code.SYSTEM.NETWORK_ERROR,null);
        }
        else
        {
            console.log('results:',results);
            callback(code.OK,results);
        }
    })
}


// epay(postUrl,function(error,result){
// //console.log('httpresult:',result);
//     $ = cheerio.load(result);
//     var getUrl =  $('input[type="hidden"]');
//     var inputParamString = '{';
//     var inputParamString1 = '/s?'
//     for( var i=0;i< getUrl.length;i++){
//         if(i != 0){
//             inputParamString += ',';
//             inputParamString1 += '&'
//         }
//         if(getUrl[i].attribs.name == 'oq'){
//             inputParamString += 'wd:"'+  urlencode(getUrl[i].attribs.value) + '",';
//             inputParamString += 'oq:"'+  urlencode(urlencode(getUrl[i].attribs.value)) + '"';
//             inputParamString1 += 'wd=' + urlencode(getUrl[i].attribs.value) + '&';
//             inputParamString1 += 'oq=' + urlencode(urlencode(getUrl[i].attribs.value));
//         }
//         inputParamString += getUrl[i].attribs.name +':"'+ getUrl[i].attribs.value + '"';
//         inputParamString1 += getUrl[i].attribs.name + '=' + getUrl[i].attribs.value;
//     }
//     inputParamString += '}'
//     //console.log(inputParamString1);
//     //console.log(inputParamString);
//     postUrl.params = inputParamString;
//     postUrl.path = inputParamString1;
//
//     //console.log(postUrl);
//     epay(postUrl,function(error,resultscall){
//         console.log(resultscall);
//         $ = cheerio.load(resultscall);
//         var inputUrl = $('a');
//         for(var i = 0;i < inputUrl.length ;i++){
//             console.log('input:',i,inputUrl[i].attribs.href);
//             if(typeof( inputUrl[i].attribs.href)!='undefined' && inputUrl[i].attribs.href.indexOf("baidu.php") != -1 ){
//                 var urlArray = inputUrl.split('//')[1].split('/');
//                 //console.log(urlArray[1]);
//                 var urlArray1 = urlArray[1].split('=');
//                 postUrl.path = '/' + urlArray[1];
//                 postUrl.method = 'post';
//                 postUrl.params = {};
//                 postUrl.params = "{" + urlArray1[0] + ':' + urlArray1[1] +  '}';
//                 //console.log(postUrl);
//                 epay(postUrl,function(error,result3){
//                     //console.log(result3);
//                 })
//             }
//         }
//
//     })
// });
function send(postUrl,callback)
{
    console.log(" COME IN");
    //var params = require('querystring').stringify(postUrl.params);
    var params = postUrl.params;
    //console.log('sendParam:',params);
    var options = {
        hostname: postUrl.host,
        port: postUrl.port,
        path: postUrl.path,
        method:postUrl.method,
        headers: {
            "Connection":"Keep-Alive",
            "Content-Type":'application/x-www-form-urlencoded;charset=utf-8',
            'Content-Length': params.length
            // 'cre':'qOUvcjdUmjf9HcH3a94j/HFFOZHfsNMfvbCTARG41EU=',
            //'userid':100002542
        }
    };
    // console.log('options:',options);

//使用http 发送
    if(options.port == 443){
        var req = https.request(options, function(res) {
            //var req = http.post(options.url + options.path, function(res) {
            console.log('STATUS: ' + res.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res.headers));
            // console.log(res);
//设置字符编码
            res.setEncoding('utf8');
//返回数据流
            var _data=[];

//数据
            res.on('data', function (chunk)
            {
                _data += chunk;
                //console.log('BODY: ' + chunk);
            });

// 结束回调
            res.on('end', function(){
                console.log("REBOAK:",_data);//JSON.parse(_data).errcode);
                callback(res.statusCode,_data);
            });

//错误回调 // 这个必须有。 不然会有不少 麻烦
            req.on('error', function(e) {
                //console.log('problem with request: ' + e.message);
                callback(res.statusCode,null);
            });
        });
        // req.write(params + "\n");
        req.write(params );
        req.end();
    }
    else
    {
        var req = http.request(options, function(res) {
            //var req = http.post(options.url + options.path, function(res) {
            console.log('STATUS: ' + res.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res.headers));
            // console.log(res);
//设置字符编码
            res.setEncoding('utf8');
//返回数据流
            var _data=[];

//数据
            res.on('data', function (chunk)
            {
                _data += chunk;
                //console.log('BODY: ' + chunk);
            });

// 结束回调
            res.on('end', function(){
                // console.log("REBOAK:",JSON.parse(_data).errcode);
                callback(res.statusCode,_data);
            });

//错误回调 // 这个必须有。 不然会有不少 麻烦
            req.on('error', function(e) {
                //console.log('problem with request: ' + e.message);
                callback(res.statusCode,null);
            });
        });
        // req.write(params + "\n");
        req.write(params );
        req.end();
    }


}


function sendhttps(postUrl,callback)
{
    console.log(" COME IN");
    //var params = require('querystring').stringify(postUrl.params);
    var params = postUrl.params;
    console.log('sendParam:',params);
    var options = {
        hostname: postUrl.host,
        port: postUrl.port,
        path: postUrl.path,
        method:postUrl.method,
        headers: {
            "Connection":"Keep-Alive",
            "Content-Type":'application/x-www-form-urlencoded;charset=utf-8',
            'Content-Length': params.length
            // 'cre':'qOUvcjdUmjf9HcH3a94j/HFFOZHfsNMfvbCTARG41EU=',
            //'userid':100002542
        }
    };
    console.log('options:',options);

//使用http 发送
    var req = http.request(options, function(res) {
        //var req = http.post(options.url + options.path, function(res) {
        console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        // console.log(res);
//设置字符编码
        res.setEncoding('utf8');
//返回数据流
        var _data=[];

//数据
        res.on('data', function (chunk)
        {
            _data += chunk;
            //console.log('BODY: ' + chunk);
        });

// 结束回调
        res.on('end', function(){
            console.log("REBOAK:",JSON.parse(_data).errcode);
            callback(res.statusCode,_data);
        });

//错误回调 // 这个必须有。 不然会有不少 麻烦
        req.on('error', function(e) {
            //console.log('problem with request: ' + e.message);
            callback(res.statusCode,null);
        });
    });
    // req.write(params + "\n");
    req.write(params );
    req.end();

}

