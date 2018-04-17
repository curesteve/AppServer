/**
 * Created by peihengyang on 14/12/11.
 */
//var enums = require('../../data_provider/dao_provider/edit/enums');
//var date = require('../../util/date');
var editResourceProvider = require('../../data_provider/dao_provider/Check/resource');
var coupondbProvider = require('../../data_provider/dao_provider/coupondb/coupon');
var path = require('path');
var fs = require('fs');
var xlsx = require('node-xlsx');
var xlstojson = require("xls-to-json");
var async = require('async');
var body = {
    title : '资源管理',
    message : null
};

exports.index = function(req, res){
    body.message = null;
    editResourceProvider.getAll(function(error, results){
        //console.log('resultall:',results[0].create_date.format('yyyy-MM-dd hh:mm:ss'));
        body.results = results;
        res.render('Check/index', body);
    });
};


exports.add =  function(req,res){
    body.message = null;
    var method = req.method;
    var files =  req.files;
    //console.log('files:',files);
    var route = 'Check/add';
    if(method === 'POST') {
        var addFun = [];
        if(files.length >= 1){
            files.Resource_File.forEach(function(File){
                //get filename
                var filename =  (File.name || path.basename(File.path));
                //copy file to a public directory
                var targetPath = path.resolve(path.dirname(__filename) , '../../public/resourceFile/')  + '/'+ filename;
                //copy file
                fs.createReadStream(File.path).pipe(fs.createWriteStream(targetPath));
                var resourceModel  = createResourceModel(req,File);

                addFun.push(function(addCallback){
                    editResourceProvider.add(resourceModel,function(error,results){
                        if(error!=null){
                            console.log(error);
                            addCallback(error,null);
                        }
                        else
                        {
                            addCallback(null,results);
                        }
                    })
                })
            });
        }
        else
        {
            var File = files.Resource_File;
            //get filename
            var filename = (File.name || path.basename(File.path));
            //copy file to a public directory
            var targetPath = path.resolve(path.dirname(__filename) , '../../public/resourceFile/')  + '/'+ filename;
            //copy file
            fs.createReadStream(File.path).pipe(fs.createWriteStream(targetPath));
            var resourceModel  = createResourceModel(req,File);
            addFun.push(function(addCallback){
                editResourceProvider.add(resourceModel,function(error,results){
                    if(error!=null){
                        console.log(error);
                        addCallback(error,null);
                    }
                    else
                    {
                        addCallback(null,results);
                    }
                })
            })
        }
        async.series(addFun,function(error,resultserise){
            if(error!=null){
                console.log(error);
                body.message = error;
            }
            else
            {
                body.result = resultserise;
            }
        })
        res.render(route,body);
    }
    else{
        res.render(route, body);
    }
};



exports.del =  function(req,res){
    body.message = null;
    var method = req.method;
    var resourceId = req.query.id;
    var route = 'Check/del';
    console.log(route);
    console.log(resourceId);
    //if(method === 'POST') {
        editResourceProvider.getResourceById(resourceId,function(error,results){
            if(error!=null){
                console.log(error);
                body.message = '获取资源错误';
            }
            else
            {
                results[0].Enable = 0;
                editResourceProvider.deleteResource(results[0].Resource_Tag,function(error,resultsUpdate){
                    if(error!=null){
                        console.log(error);
                        body.message = '删除资源表错误';
                    }
                    else
                    {
                        body.message = '删除资源表成功';
                    }
                })
            }
            res.render(route,body);
        })
    //}
    //else{
    //    res.render(route, body);
    //}
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