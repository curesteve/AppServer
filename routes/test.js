/**
 * Created by peihengyang on 14-10-15.
 */

var cheerio = require('cheerio');
var http = require('http');
var urlencode = require('urlencode');
var postUrl = {
    host:'www.baidu.com',
    port:80,
    path:'/s?wd=全球使命',
    params:{"wd":"全球使命"},
    method:'get'
}
epay(postUrl,function(error,result){
//console.log('httpresult:',result);
    $ = cheerio.load(result);
    var getUrl =  $('input[type="hidden"]');
    var inputParamString = '{';
    var inputParamString1 = '/s?'
    for( var i=0;i< getUrl.length;i++){
        if(i != 0){
            inputParamString += ',';
            inputParamString1 += '&'
        }
        if(getUrl[i].attribs.name == 'oq'){
            inputParamString += 'wd:"'+  urlencode(getUrl[i].attribs.value) + '",';
            inputParamString += 'oq:"'+  urlencode(urlencode(getUrl[i].attribs.value)) + '"';
            inputParamString1 += 'wd=' + urlencode(getUrl[i].attribs.value) + '&';
            inputParamString1 += 'oq=' + urlencode(urlencode(getUrl[i].attribs.value));
        }
        inputParamString += getUrl[i].attribs.name +':"'+ getUrl[i].attribs.value + '"';
        inputParamString1 += getUrl[i].attribs.name + '=' + getUrl[i].attribs.value;
    }
    inputParamString += '}'
    //console.log(inputParamString1);
    //console.log(inputParamString);
    postUrl.params = inputParamString;
    postUrl.path = inputParamString1;

    //console.log(postUrl);
    epay(postUrl,function(error,resultscall){
       console.log(resultscall);
        $ = cheerio.load(resultscall);
        var inputUrl = $('a');
        for(var i = 0;i < inputUrl.length ;i++){
            console.log('input:',i,inputUrl[i].attribs.href);
            if(typeof( inputUrl[i].attribs.href)!='undefined' && inputUrl[i].attribs.href.indexOf("baidu.php") != -1 ){
                var urlArray = inputUrl.split('//')[1].split('/');
                //console.log(urlArray[1]);
                var urlArray1 = urlArray[1].split('=');
                postUrl.path = '/' + urlArray[1];
                postUrl.method = 'post';
                postUrl.params = {};
                postUrl.params = "{" + urlArray1[0] + ':' + urlArray1[1] +  '}';
                //console.log(postUrl);
                epay(postUrl,function(error,result3){
                    //console.log(result3);
                })
            }
        }

    })
});
function epay(postUrl,callback)
{

    console.log(" COME IN");
    var params = require('querystring').stringify(postUrl.params);

    var options = {
        host: postUrl.host,
        port: postUrl.port,
        path: postUrl.path,
        method:postUrl.method,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': params.length
           // 'cre':'qOUvcjdUmjf9HcH3a94j/HFFOZHfsNMfvbCTARG41EU=',
            //'userid':100002542

        }
    };
    console.log('options:',options);

//使用http 发送
    var req = http.request(options, function(res) {
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        //console.log(res);
//设置字符编码
        res.setEncoding('utf8');
//返回数据流
        var _data="";

//数据
        res.on('data', function (chunk)
        {
            _data+=chunk;
            //console.log('BODY: ' + chunk);
        });

// 结束回调
        res.on('end', function(){
            //console.log("REBOAK:",_data);
            callback(null,_data);
        });

//错误回调 // 这个必须有。 不然会有不少 麻烦
        req.on('error', function(e) {
            //console.log('problem with request: ' + e.message);
        });



    });
    req.write(params + "\n");
    req.end();

}
//exports.epay=epay;
