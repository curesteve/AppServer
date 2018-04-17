/**
 * Created by peihengyang on 15/7/20.
 */

var action = require('./data_provider/dao_provider/logs/action');

action.getList([1001], {start:0,page_size:100}, function(error, list){
   console.log(list);
});