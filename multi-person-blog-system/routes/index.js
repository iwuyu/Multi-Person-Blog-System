var express = require('express');
var router = express.Router();

let userLogin = require('./login/userLogin');

/* 用户发送验证码 */
router.post('/user/sendMail', userLogin.sendMail);

/* 用户登录 */
router.post('/user/login', userLogin.userLogin);

/* 用户注册 */
router.post('/user/register', userLogin.userRegister);

/* 判断用户是否在登录状态 */
router.post('/user/isLogined', userLogin.userIsLogined);

/* 用户退出登录 */
router.post('/user/offline', userLogin.userExit);

module.exports = router;
