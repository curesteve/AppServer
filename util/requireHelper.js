/**
 * Created by peihengyang on 15/7/20.
 */
var requireHelper = module.exports;

requireHelper.clear = function(key){
    //var key = require.resolve('../../config/gameConfig/items/alms.json');
    if(!!require.cache[key]){
        var id = require.cache[key].id;
        delete require.cache[id];
    }
};