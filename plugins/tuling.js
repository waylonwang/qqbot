(function(){
  var http = require('http');
  var querystring = require('querystring');
  var log = new (require('log'))('debug');

  var API_KEY = 'c268de590aed467dba359955708c38c8';

  var get_Message = function(info,callback){
    var contents = querystring.stringify(info);
    var options = {
        host: 'www.tuling123.com',
        path: '/openapi/api',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length' : contents.length
        }
    };
    var req = http.request(options,function(res){
      var code;
      if (res.statusCode==200){
        res.setEncoding('UTF-8');
        res.on('data', function (data) {
          try{
            code = JSON.parse(data).code;
          }catch(err){
            log.debug('[图灵处理错误]',err.message);
          }
          if (code=='100000'){
            retMessage = JSON.parse(data).text;
          }else if (code=='200000') {
            retMessage = JSON.parse(data).text + ' ' + JSON.parse(data).url;
          }else if (code=='302000') {
            retMessage = '《' + JSON.parse(data).list[0].article + '》' + ' ' + JSON.parse(data).detailurl;
          }else if (code=='308000') {
            retMessage = '《' + JSON.parse(data).list[0].name + '》' + ' ' + JSON.parse(data).detailurl;
          }else if (code=='40001') {
            retMessage = '我出了点小故障，修复后再陪你聊';
            log.debug('未发送正确的APIKEY给图灵');
          }else if (code=='40002') {
            retMessage = '我出了点小故障，修复后再陪你聊';
            log.debug('未发送正确的info给图灵');
          }else if (code=='40004') {
            retMessage = '对不起，我已经休息了，明天再继续工作:)';
          }else if (code=='40007') {
            retMessage = '我出了点小故障，修复后再陪你聊';
            log.debug('未发送正确的数据给图灵');
          }else{
            retMessage = '我出了点小故障，修复后再陪你聊';
          }
          var data = {
            'userid': info.userid,
            'text': retMessage
          };
          callback(data);
        });
      }else{
        log.debug('图灵HTTP请求失败');
      }
    });
    req.write(contents);
    req.end();
  };

  /*
   @param content 消息内容
   @param send(content)  回复消息
   @param robot qqbot instance
   @param message 原消息对象
   */
  module.exports = function(content, send, robot, message) {
    var info = {
      key: API_KEY,
      info: content,
      userid: message.from_uin
    };
    try{
      get_Message(info,function(data){
        send(data.text);
        log.debug("[图灵消息]","[" + data.userid + "] " + data.text);
      });
    } catch (undefined) {
      log.error("[获取图灵消息失败]");
    }
  };
}).call(this);
