/**
 * Created by yangpeiheng on 2016/10/13.
 */


var code = require('../../../config/code');
var sqlClient = require('../../dao/sqlClient').admin;
var sqlCommand = require('../../dao/sqlCommand');
var logger = require('log4js').getLogger("db");
var coupon = module.exports;

coupon.getCoupon_PacketById = function (packetId,itemId,callback) {
    var sql = new sqlCommand('EXEC [Check].dbo.GetCoponForCheck ?,? ',[packetId,itemId]);
    sqlClient.query(sql, function(error, results){
        if(error){
            console.log(error);
            callback(code.DB.EXEC_QUERY_ERROR, null);
        }
        else{
            callback(null,results);
        }
    })
};

coupon.getCoupon_PacketByIds = function (packetIds,callback) {
    var sql = new sqlCommand('SELECT  CP.[PacketID] ' +
        ' ,[PacketName]' +
        ',CC.ClassName' +
        ',[LastUpdateTime]' +
        ',CP.[PacketItemCount]' +
        ',[PacketDescription]' +
        ',[Gold]' +
        ',[Title]' +
        ',[Message]' +
        ',[GiverName]' +
        ',[BindCash]' +
        ',CTDP.DeleDate' +
        ',CPI.ItemID' +
         ' FROM [CouponDB].[dbo].[Coupon_Packet] CP LEFT JOIN [CouponDB].[dbo].[Coupon_Class] CC ON CP.ClassID = CC.ClassID' +
        ' LEFT JOIN [CouponDB].[dbo].[Coupon_TobeDelPacket] CTDP ON CP.PacketID = CTDP.PacketID' +
        ' JOIN [CouponDB].[dbo].[Coupon_PacketItem] CPI ON CP.PacketID = CPI.PacketID WHERE CP.PacketID IN ('+packetIds+')');
    sqlClient.query(sql, function(error, results){
        if(error){
            console.log(error);
            callback(code.DB.EXEC_QUERY_ERROR, null);
        }
        else{
            callback(null,results);
        }
    })
};