/**
 * Created by yangpeiheng on 2016/10/9.
 */
var typeofSQL = module.exports;
//var adminProvider = require('../data_provider/dao_provider/admin/adminProvider');

typeofSQL.typeof = function(param){
    switch (typeof param)
    {
        case 'number':
            return 'Int';
            break;
        case 'string':
            return 'NVarChar';
        break;
        case 'object':
            if (param instanceof Date)
            {
                return 'DateTime';
            }
            else if (param instanceof Array)
        {
            return 'Array';
        }
        else
            {
                return 'object';
            }
            break;
        default:
            return 'NVarChar';
        break;

    }
}