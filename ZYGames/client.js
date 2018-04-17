var http = require("http");
var dictionary = require("./dictionary")
var crypto = require('crypto');


var clientid = 1
var secret = "acb25ec4cd884e44aa0cde9a9a3fdc88"

var parameters = new dictionary()

parameters.store("clientId",clientid);
parameters.store("name","curesteve");
parameters.store("password","654321");

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
  
 var callback = function(response){
    var body = '';
    response.on('data', function(data) {
       body += data;
    });
    
    response.on('end', function() {
       console.log('body:',body);
    });
 }
 var req = http.request(options, callback);
 req.end();



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

