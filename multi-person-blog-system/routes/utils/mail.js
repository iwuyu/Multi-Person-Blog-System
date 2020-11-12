"use strict";
const nodemailer = require("nodemailer");
// 创建发送邮件的请求对象
let transporter = nodemailer.createTransport({
  host: "smtp.qq.com", // 发送方邮箱 qq
  port: 465, // 端口号
  secure: true, // true for 465, false for other ports
  auth: {
    user: '862602350@qq.com', // 发送方的邮箱地址
    pass: 'qcbpbbaukwizbchf', // mpt 验证码 edtnxvjzmrmsiagi
  },
});

function send(mail,code){
  // 邮件信息
  let mailobj = {
    from: '"Fred Foo 👻" <862602350@qq.com>', // <sender address>
    to: mail, // list of receivers
    subject: "验证码", // Subject line
    text: `您的验证码是${code},有效期为五分钟`, // plain text body 只能是字符串类型
    // html: "<b>Hello world?</b>", // html body
  }

  return new Promise((resolve,reject) => {
    // 发送邮件
    transporter.sendMail(mailobj,(err,data)=>{
      if(err){
        reject('发送失败')
      }else{
        resolve('发送成功')
      }
    });
  })
}
module.exports = {send}