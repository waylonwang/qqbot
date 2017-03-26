(function(){
  var http = require('http');
  var querystring = require('querystring');
  var log = new (require('log'))('debug');
  var robot;

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
            retMessage = '我出了点小故障，修复后再告诉你';
            log.debug('未发送正确的APIKEY给图灵');
          }else if (code=='40002') {
            retMessage = '我出了点小故障，修复后再告诉你';
            log.debug('未发送正确的info给图灵');
          }else if (code=='40004') {
            retMessage = '对不起，我已经休息了，明天再继续工作:)';
          }else if (code=='40007') {
            retMessage = '我出了点小故障，修复后再告诉你';
            log.debug('未发送正确的数据给图灵');
          }else{
            retMessage = '我出了点小故障，修复后再告诉你';
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
  @param rule 匹配规则
  @param condition 匹配条件
  @param matchindex 匹配子查询索引
   */
  var match_rule = function(rule,condition,matchindex){
    var regexp_rule;
    try {
      eval('regexp_rule =/^'+rule+'$/g');
      return regexp_rule.exec(condition)[matchindex].replace(/(^\s*)|(\s*$)/g, '');
    }catch (undefined) {
      return '';
    }
  };

  /*
  @param name 规则名称
   */
  var get_rule = function(name){
    var rule;
    try{
      eval('rule = JSON.parse(this.robot.config.tuling_' + name + ').rule');
    }catch(undefined){
      rule = '()';
    }
    return rule;
  };

  /*
  @param name 规则名称
   */
  var get_matchindex = function(name){
    var matchindex;
    try{
      eval('matchindex = JSON.parse(this.robot.config.tuling_' + name + ').matchindex');
    }catch(undefined){
      matchindex = 1;
    }
    return matchindex;
  };

  /*
  @param content 消息内容
  @param message 原消息对象
  @param user_account 用户QQ号
   */
  var get_Command = function(content,message,user_account){
    var result;

    //过滤规则：处理群组->处理用户->处理关键词
    //名单规则：处理白名单->处理黑名单
    if (message.type=='message'){
      //单聊时不应用群组黑白名单、关键词黑白名单处理规则

      //STEP1.处理白名单用户
      result = match_rule(get_rule('whitelist_user'),user_account,get_matchindex('whitelist_user'));
      if (result == '') return '';

      //STEP2.处理黑名单用户
      result = match_rule(get_rule('blacklist_user'),user_account,get_matchindex('blacklist_user'));
      if (result != '') return '';

      return content;
    }else if (message.type=='group_message') {
      //群聊时应用所有规则

      //STEP1.处理白名单群组
      result = match_rule(get_rule('whitelist_group'),message.from_group.account,get_matchindex('whitelist_group'));
      if (result == '') return '';

      //STEP2.处理黑名单群组
      result = match_rule(get_rule('blacklist_group'),message.from_group.account,get_matchindex('blacklist_group'));
      if (result != '') return '';

      //STEP3.处理白名单用户
      result = match_rule(get_rule('whitelist_user'),user_account,get_matchindex('whitelist_user'));
      if (result == '') return '';

      //STEP4.处理黑名单用户
      result = match_rule(get_rule('blacklist_user'),user_account,get_matchindex('blacklist_user'));
      if (result != '') return '';

      //STEP5.处理白名单关键词
      result = match_rule(get_rule('whitelist_keyword'),content,get_matchindex('whitelist_keyword'));
      if (result == '') {
        return '';
      }else{
        content = result;
      }

      //STEP6.处理黑名单关键词
      result = match_rule(get_rule('blacklist_keyword'),content,get_matchindex('blacklist_keyword'));
      if (result != '') return '';

      return content;
    }else{
      //聊天组及临时聊天不支持
      return '';
    }
  };

  /*
   @param content 消息内容
   @param send(content)  回复消息
   @param robot qqbot instance
   @param message 原消息对象
   */
  module.exports = function(content, send, robot, message) {
    var user_account,user_nick;
    try{
      this.robot = robot;
      user_nick = message.from_user.nick;
      eval('user_account = this.robot.user_account_table.uin' + message.from_uin + '.account');
    }catch(undefined){
    }

    var cmd = get_Command(content,message,user_account);
    //未能匹配到有效命令时不响应
    if (cmd=='') return;

    try{
      var info = {
        key: this.robot.config.tuling_api_key,
        info: cmd,
        userid: message.from_uin
      };
      get_Message(info,function(data){
        send(this.robot.config.tuling_reply_prefix + '@' + user_nick + ' ' + data.text);
        log.debug("[图灵消息]","[" + data.userid + "] " + data.text);
      });
    } catch (undefined) {
      log.error("[获取图灵消息失败]");
    }
  };
}).call(this);
