var stringUtil = module.exports;

stringUtil.getStringFromXml = function(param){
    return param.toString().replace(/']/,'').replace('[','');
}