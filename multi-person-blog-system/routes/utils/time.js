/* 
// 获取时间中的年月日时分秒 
myDate.getYear(); // 获取当前年份(2位)
myDate.getFullYear(); // 获取完整的年份(4位,1970-????)
myDate.getMonth(); // 获取当前月份(0-11,0代表1月)
myDate.getDate(); // 获取当前日(1-31)
myDate.getDay(); // 获取当前星期X(0-6,0代表星期天)
myDate.getTime(); // 获取当前时间(从1970.1.1开始的毫秒数)
myDate.getHours(); // 获取当前小时数(0-23)
myDate.getMinutes(); // 获取当前分钟数(0-59)
myDate.getSeconds(); // 获取当前秒数(0-59)
myDate.getMilliseconds(); // 获取当前毫秒数(0-999)
myDate.toLocaleDateString(); // 获取当前日期
var mytime = myDate.toLocaleTimeString(); // 获取当前时间
myDate.toLocaleString(); // 获取日期与时间 
*/



/* 对Date的扩展，将 Date 转化为指定格式的String
月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
例子：
(new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
(new Date()).Format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18 */

// 时间的格式化
Date.prototype.Format = function (fmt) { // author: meizz
  var o = {
    "M+": this.getMonth() + 1, // 月份
    "d+": this.getDate(), // 日
    "h+": this.getHours(), // 小时
    "m+": this.getMinutes(), // 分
    "s+": this.getSeconds(), // 秒
    "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
    "S": this.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

getLocalTime = template => {
  var time = new Date().Format(template); 
  return time;
}

// 通过时间戳获取正常的时间显示
getTime = (data,type) => {
  var _data = data;
  //如果是13位正常，如果是10位则需要转化为毫秒
  if (String(data).length == 13) {
    _data = data
  } else {
    _data = data*1000
  }
  const time = new Date(_data);    
  let Y = time.getFullYear();
  let M = time.getMonth();
  let D = time.getDate();
  let h = time.getHours();
  let m = time.getMinutes();
  let s = time.getSeconds();
  // M = M < 10 ? "0" + M : M;
  // D = D < 10 ? "0" + D : D;
  // h = h < 10 ? "0" + h : h;
  // m = m < 10 ? "0" + m : m;
  // s = s < 10 ? "0" + s : s;
  //自定义选择想要返回的类型
  if(type=="YMD"){
    const arr = ["一","二","三","四","五","六","七","八","九","十","十一","十二"];
    M = arr[M]; 
    return `${M}月 ${D}, ${Y}`
  }else if(type=="hms"){
    return `${h}:${m}:${s}`
  }else if(type=="YMDhm"){
    return `${Y}-${M}-${D} ${h}:${m}`
  }else{
    return `${Y}-${M}-${D} ${h}:${m}:${s}`
  }
}

// ("yyyy-MM-dd")
// ("yyyy-MM-dd hh:mm:ss")

module.exports = {getLocalTime,getTime}