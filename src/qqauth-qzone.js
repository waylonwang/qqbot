function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

(function () {
  var fs = require('fs');
  var os = require("os");
  var https = require("https");
  var http = require('http');
  var crypto = require('crypto');
  var querystring = require('querystring');
  var Url = require('url');
  var Path = require('path');
  var Log = require('log');
  var encryptPass = require('./encrypt');
  var client = require('./httpclient');

  var log = new Log('debug');

  var client_id = 53999199;

  var md5 = function (str) {
    return crypto.createHash('md5').update(str.toString()).digest('hex');
  };

  var prepare_login = function (callback) {
    // client.update_cookies('RK=OfeLBai4FB; ptcz=ad3bf14f9da2738e09e498bfeb93dd9da7540dea2b7a71acfb97ed4d3da4e277; pgv_pvi=911366144; ptisp=ctc; pgv_info=ssid=s5714472750; pgv_pvid=1051433466; qrsig=hJ9GvNx*oIvLjP5I5dQ19KPa3zwxNI62eALLO*g2JLbKPYsZIRsnbJIxNe74NzQQ;'.split(' '));
    client.update_cookies('pt_user_id=5014860641088708803; pt_local_token=0.136195320143762; pt_login_sig=iJZBOFLy-v8WidGQ*GhaFkbXdiIW5E4i*h20Vl4NQ0Dc8BabDi9DJx6njPqNk4uL; pt_clientip=26bfb70f585367a3; pt_serverip=81980a821b412dc8; ptui_identifier=000D6060EA6CB445DE111F6741BEF66FC82296D07B3F599D133090E9; qrsig=tcUIgeENWjZBPE-sd7aqBjirIcLvPkOgU4mwthVU7HnRQpFnk0HJZUUdGsuW1sIJ'.split(' '));
    // var url = 'https://ui.ptlogin2.qq.com/cgi-bin/login?daid=164&target=self&style=16&mibao_css=m_webqq&appid=501004106&enable_qlogin=0&no_verifyimg=1&s_url=http%3A%2F%2Fw.qq.com%2Fproxy.html&f_url=loginerroralert&strong_login=1&login_state=10&t=20131024001';
    var url = 'http://ui.ptlogin2.qq.com/cgi-bin/login?appid=549000912&daid=5&style=12&s_url=http%3A%2F%2Fqun.qzone.qq.com%2Fgroup';
    return client.url_get(url, function (err, resp, body) {
      return callback([]);
    });
  };

  // function getCookie(key) {
  //       var startIndex, endIndex, cookie = client.get_cookies_string();
  //       if (cookie.length > 0) {
  //           startIndex = cookie.indexOf(key + '=');
  //           if (startIndex !== -1) {
  //               startIndex = startIndex + key.length + 1;
  //               endIndex = cookie.indexOf(';', startIndex);
  //               if (endIndex === -1) {
  //                   endIndex = cookie.length;
  //               }
  //               return decodeURI(cookie.substring(startIndex, endIndex));
  //           }
  //       }
  //       return '';
  //   }

  // 解码cookie qrsig的值
  function decodeQrsig(t) {
    for (var e = 0, i = 0, n = t.length; n > i; ++i)e += (e << 5) + t.charCodeAt(i);
    return 2147483647 & e
  }

  var check_qq_verify = function (callback) {
    var qrsig = decodeQrsig(getCookie('qrsig')),

      options = {
        protocol: 'http:',
        host: 'ptlogin2.qq.com',
        // path: '/ptqrlogin?ptqrtoken='+qrsig+'&webqq_type=10&remember_uin=1&login2qq=1&aid=501004106&u1=http%3A%2F%2Fw.qq.com%2Fproxy.html%3Flogin2qq%3D1%26webqq_type%3D10&ptredirect=0&ptlang=2052&daid=164&from_ui=1&pttype=1&dumy=&fp=loginerroralert&action=0-0-123332&mibao_css=m_webqq&t=undefined&g=1&js_type=0&js_ver=10141&login_sig=&pt_randsalt=0',
        path: '/ptqrlogin?u1=http%3A%2F%2Fqun.qzone.qq.com%2Fgroup&ptqrtoken=' + qrsig + '&ptredirect=1&h=1&t=1&g=1&from_ui=1&ptlang=2052&action=0-0-1491075626973&js_ver=10203&js_type=1&login_sig=ijVDPPz8XP7mSCkzcTLn*nlAhVefhLUBZgittUDKJ98woNX0FZF5mIHkQDPhm30Q&pt_uistyle=40&aid=549000912&daid=5&',
        headers: {
          'Cookie': client.get_cookies_string(),
          // 'Referer':'https://ui.ptlogin2.qq.com/cgi-bin/login?daid=164&target=self&style=16&mibao_css=m_webqq&appid=501004106&enable_qlogin=0&no_verifyimg=1&s_url=http%3A%2F%2Fw.qq.com%2Fproxy.html&f_url=loginerroralert&strong_login=1&login_state=10&t=20131024001'
          'Referer': 'http://ui.ptlogin2.qq.com/cgi-bin/login?appid=549000912&daid=5&style=12&s_url=http%3A%2F%2Fqun.qzone.qq.com%2Fgroup'
        }
      };
    // http://ptlogin2.qzone.qq.com/check_sig?pttype=1&uin=3010897940&service=ptqrlogin&nodirect=0&ptsigx=49f7624f2682e717261a1648177a583872736199313a9332ba5b6c09d247c9f0459f302cc144722f258ded3ed8461fae31aeb59c04300690777d30c5c0022940&s_url=http%3A%2F%2Fqun.qzone.qq.com%2Fgroup&f_url=http%3A%2F%2Fid.qq.com%2Fpossiblev3%2Fpossible.html%3Fver%3D7%26errorno%3D1%26frienduin%3D83057255&ptlang=2052&ptredirect=101&aid=549000912&daid=5&j_later=0&low_login_hour=0&regmaster=0&pt_login_type=3&pt_aid=0&pt_aaid=16&pt_light=0&pt_3rd_aid=0
    return client.url_get(options, function (err, resp, body) {
      var ret = body.match(/\'(.*?)\'/g).map(function (i) {
        var last = i.length - 2;
        return i.substr(1, last);
      });
      //console.log(ret);
      return callback(ret);
    });
  };

  var get_qr_code = function (qq, host, port, callback) {
    // var url = "https://ssl.ptlogin2.qq.com/ptqrshow?appid=501004106&e=0&l=M&s=5&d=72&v=4&t=" + Math.random();
    var url = "https://ssl.ptlogin2.qq.com/ptqrshow?appid=549000912&e=2&l=M&s=3&d=72&v=4&t=" + +Math.random() + "&daid=5";

    return client.url_get(url, function (err, resp, body) {
      create_img_server(host, port, body, resp.headers);
      return callback();
    }, function (resp) {
      resp.setEncoding('binary');
    });
  };


  function ptui_auth_CB(t, e) {
    // switch (parseInt(t)) {
    //   case 2:
        return e + '&aid=549000912&s_url=http%3A%2F%2Fqun.qzone.qq.com%2Fgroup';
      // default:
      //   break;
    // }
  }

  var time33 = function (t) {
    for (var e = 0,
           i = 0,
           n = t.length; n > i; i++) e = (33 * e + t.charCodeAt(i)) % 4294967296;
    return e
  };

  function hash33(t) {
    for (var e = 0,
           i = 0,
           n = t.length; n > i; ++i) e += (e << 5) + t.charCodeAt(i);
    return 2147483647 & e
  }

  function getGTK(str){
    var hash = 5381;
    for(var i = 0, len = str.length; i < len; ++i)
    {
      hash += (hash << 5) + str.charAt(i).charCodeAt();
    }
    return hash & 0x7fffffff;
  }

  var finish_verify_code = function () {
    return stop_img_server();
  };

  var img_server = null;

  var create_img_server = function (host, port, body, origin_headers) {
    if (img_server) {
      return;
    }

    var dir_path = Path.join(getUserHome(), ".tmp");
    if (!fs.existsSync(dir_path)) fs.mkdirSync(dir_path);

    var file_path = Path.join(getUserHome(), ".tmp", "qrcode.jpg");
    fs.writeFileSync(file_path, body, 'binary');

    if (process.platform !== 'darwin') {
      img_server = http.createServer(function (req, res) {
        res.writeHead(200, origin_headers);
        return res.end(body, 'binary');
      });
      return img_server.listen(port);
    } else {

    }
  };

  var stop_img_server = function () {
    if (img_server) {
      img_server.close();
    }
    return img_server = null;
  };

  var login_token = function (cookies, auth_info, callback) {
    client.update_cookies(cookies);

    var auth_url = '',
      ETK = client.get_cookie('ETK', 'ptlogin2.qq.com'),
      qrsig = hash33(client.get_cookie('qrsig', 'ptlogin2.qq.com')),
      superuin = client.get_cookie('superuin', 'ptlogin2.qq.com'),
      superkey = client.get_cookie('superkey', 'ptlogin2.qq.com'),
      supertoken = client.get_cookie('supertoken', 'ptlogin2.qq.com'),
      pt_recent_uins = client.get_cookie('pt_recent_uins', 'ptlogin2.qq.com'),
      pt_guid_sig = client.get_cookie('pt_guid_sig', 'ptlogin2.qq.com'),
      pt_login_sig = client.get_cookie('pt_login_sig', 'ptlogin2.qq.com'),
      pt_clientip = client.get_cookie('pt_clientip', 'ptlogin2.qq.com'),
      pt_serverip = client.get_cookie('pt_serverip', 'ptlogin2.qq.com'),
      ptwebqq = client.get_cookie('ptwebqq', 'qq.com'),
      pt2gguin = client.get_cookie('pt2gguin', 'qq.com'),
      pgv_pvid = client.get_cookie('pgv_pvid'),
      pgv_info = client.get_cookie('pgv_info'),
      RK = client.get_cookie('RK');

    // var p_skey = 'fYPtKLk9TQoziaA9BkOxJGpA56gYjrKR7j3TAik-5io_';  //client.get_cookie('p_skey');
    // var pt4_token = client.get_cookie('pt4_token');

    client.update_cookies(('pgv_info=' + pgv_info + '; pgv_pvid=' + pgv_pvid + '; qrsig=' + qrsig + '; ETK=' + ETK + '; superuin=' + superuin + '; superkey=' + superkey + '; supertoken=' + supertoken + '; pt_recent_uins=' + pt_recent_uins + '; pt_guid_sig=' + pt_guid_sig + '; ptisp=ctc; RK=' + RK + '; ptnick_3010897940=e4ba91e8b0b7e5b08fe7a798; pt2gguin=' + pt2gguin + '; ptwebqq=' + ptwebqq + '; pt_login_sig=' + pt_login_sig + '; pt_clientip=' + pt_clientip + '; pt_serverip=' + pt_serverip).split(' '));
    var options = {
      host: 'ptlogin2.qq.com',
      path: '/pt4_auth?daid=5&appid=549000912&auth_token=' + time33(supertoken),
      headers: {
        'Cookie': client.get_cookies_string(),
        'Referer': 'http://ui.ptlogin2.qq.com/cgi-bin/login?appid=549000912&daid=5&style=12&s_url=http://qun.qzone.qq.com/group'
      }
    };

    //获取auth_url
    client.url_get(options, function (err, resp, body) {
      eval('auth_url=' + body);
      client.url_get(auth_url, function (err, resp, body) {
        log.debug("BODY:", body);
        return callback(client.get_cookies());
      });
    });
  };

  var get_buddy = function (vfwebqq, psessionid, callback) {
    //http://ptlogin2.qzone.qq.com/check_sig?uin=3010897940&ptsigx=7f297236e0c3cca4758e8555197761715b03bff5e4d98be73ed30938beda0d89c81d1fd617faf7141d027b793d251b106ec61e51c80d39e95b3599161c0f71e1&daid=5&pt_login_type=4&service=pt4_auth&pttype=2&regmaster=0&regmaster=&aid=549000912&s_url=http%3A%2F%2Fqun.qzone.qq.com%2Fgroup
    //ptisp=ctc; RK=hEd25UTe3q; pt2gguin=o3010897940; uin=o3010897940; skey=@xwcdQhcS6; pgv_info=ssid=s1814298604; pgv_pvid=5371714592; o_cookie=3010897940; ptwebqq=7492dc6d5f736dd863fe944d89f219ea05399751f84d90fe51eabd9d89f34675
    //ptlogin2.qzone.qq.com
    //http://ui.ptlogin2.qq.com/cgi-bin/login?appid=549000912&daid=5&style=12&s_url=http://qun.qzone.qq.com/group
    return client.url_get({
      method: 'GET',
      protocol: 'http:',
      host: 'd1.web2.qq.com',
      path: '/channel/get_online_buddies2?vfwebqq=' + vfwebqq + '&clientid=' + client_id + '&psessionid=' + psessionid + '&t=' + Math.random(),
      headers: {
        'Cookie': client.get_cookies_string(),
        'Origin': 'http://d1.web2.qq.com',
        'Referer': 'http://d1.web2.qq.com/proxy.html?v=20151105001&callback=1&id=2',
      }
    }, function (err, resp, body) {
      //console.log(body);
      var ret = JSON.parse(body);
      return callback(ret);
    });
  };

  var get_cardname = function(cookies,callback){
    client.update_cookies(cookies);

    var uin = client.get_cookie('uin','qq.com'),
      skey = client.get_cookie('skey','qq.com'),
      pgv_pvid = client.get_cookie('pgv_pvid'),
      pgv_info = client.get_cookie('pgv_info'),
      RK = client.get_cookie('RK'),
      p_uin = client.get_cookie('p_uin','qzone.qq.com'),
      p_skey = client.get_cookie('p_skey','qzone.qq.com'),
      pt4_token = client.get_cookie('pt4_token','qzone.qq.com');
    var g_tk = getGTK(skey);

    //http://qinfo.clt.qq.com/cgi-bin/mem_card/get_group_mem_card?gc=892015&bkn=1737182977&u=216376
    //http://qinfo.clt.qq.com/cgi-bin/qun_info/get_group_members?gc=892015&bkn=1737182977&u=216376
    //http://qinfo.clt.qq.com/cgi-bin/qun_info/get_group_members_new?gc=892015&bkn=1737182977&u=216376
    client.update_cookies(('RK='+RK+'; pgv_pvid='+pgv_pvid+'; pgv_info='+pgv_info+'; ptisp=ctc; ptcz=2258d227941be1f99003ecb735fb3487e77451505f34584d3e728f738cbee45a; zzpaneluin=; zzpanelkey=; pgv_pvi=3305744384; pgv_si=s3935181824; pt2gguin=o3010897940; uin='+uin+'; skey='+skey+'; p_uin='+p_uin+'; p_skey='+p_skey+'; pt4_token='+pt4_token+'; Loading=Yes; qzspeedup=sdch').split(' '));
    var options = {
      host: 'qun.qzone.qq.com',
      path: '/cgi-bin/get_group_member?callbackFun=get_group_member&uin=3010897940&groupid=892015&neednum=1&r=0.11913503713137463&g_tk='+ g_tk,
      headers: {
        'Cookie':client.get_cookies_string(),
        'Referer':'http://qun.qzone.qq.com/group'
      }
    };
    client.url_get(options, function(err, resp, body){
      var memberlist;
      eval('memberlist=' + body);
      callback(memberlist);
    });
  };
  
  var get_group_member_Callback = function (cards) {
    return JSON.stringify(cards);
  }

  var auto_login = function (ptwebqq, callback) {
    log.info("登录 step3 获取 vfwebqq");
    return get_vfwebqq(ptwebqq, function (ret) {
      if (ret.retcode === 0) {
        var vfwebqq = ret.result.vfwebqq;

        log.info("登录 step4 获取 uin, psessionid");
        return login_token(ptwebqq, null, function (ret) {
          if (ret.retcode === 0) {
            log.info('登录成功');
            var auth_options = {
              clientid: client_id,
              ptwebqq: ptwebqq,
              vfwebqq: vfwebqq,
              uin: ret.result.uin,
              psessionid: ret.result.psessionid,
            };
            //console.log(auth_options);
            log.info("登录 step5 获取 好友列表");
            return get_buddy(vfwebqq, ret.result.psessionid, function (ret) {
              return callback(client.get_cookies(), auth_options);
            });
          } else {
            log.info("登录失败");
            return log.error(ret);
          }
        });
      } else {
        log.info("登录失败");
        return log.error(ret);
      }
    });
  };

  var wait_scan_qrcode = function (callback) {
    log.info("登录 step1 等待二维码校验结果");
    return check_qq_verify(function (ret) {
      var retcode = parseInt(ret[0]);
      if (retcode === 0 && ret[2].match(/^http/)) {
        var url = ret[2];

        return client.url_get(url, function (err, resp, body) {
          log.debug("BODY", body);
        }, function (resp) {
          resp.setEncoding('binary');
        });

        // log.info("登录 step2 cookie 获取 ptwebqq");
        // return get_ptwebqq(ret[2], function(ret){
        //     var ptwebqq = client.get_cookies().filter(function(item) {
        //         return item.match(/ptwebqq/);
        //     }).pop().replace(/ptwebqq\=(.*?);.*/, '$1');
        //
        //     return auto_login(ptwebqq, callback);
        // });

      } else if (retcode === 66 || retcode === 67) {
        setTimeout(wait_scan_qrcode, 1000, callback);

      } else {
        log.error("登录 step1 failed", ret);

      }
    });
  };

  var auth_with_qrcode = function (opt, callback) {
    var qq = opt.account;

    log.info("登录 step0.5 获取二维码");
    return get_qr_code(qq, opt.host, opt.port, function (error) {
      if (process.platform === 'darwin') {
        log.notice("请用 手机QQ 扫描该二维码");
        var file_path = Path.join(getUserHome(), ".tmp", "qrcode.jpg");
        require('child_process').exec('open ' + file_path);
      } else {
        log.notice("请用 手机QQ 扫描该地址的二维码图片->", "http://" + opt.host + ":" + opt.port);
      }

      return wait_scan_qrcode(callback);
    });
  };

  /*
   全局登录函数，如果有验证码会建立一个 http-server ，同时写入 tmp/*.jpg (osx + open. 操作)
   http-server 的端口和显示地址可配置
   @param options {account,password,port,host}
   @callback( cookies , auth_options ) if login success
   */

  var login = function (options, callback) {
    var opt = options;
    var qq = opt.account, pass = opt.password;
    return prepare_login(function (result) {
      log.info('登录 step0 - 登录方式检测');
      return check_qq_verify(function (ret) {
        //console.log(ret);
        var need_verify = parseInt(ret[0]), verify_code = ret[1], bits = ret[2], verifySession = ret[3];
        if (need_verify == 65 || need_verify == 66) {
          return auth_with_qrcode(opt, callback);
        } else {
          console.log(result);
        }
      });
    });
  };

  module.exports = {
    prepare_login: prepare_login,
    check_qq_verify: check_qq_verify,
    get_qr_code: get_qr_code,
    login_token: login_token,
    get_cardname: get_cardname,
    finish_verify_code: finish_verify_code,
    auth_with_qrcode: auth_with_qrcode,
    auto_login: auto_login,
    login: login,
  };

}).call(this);
