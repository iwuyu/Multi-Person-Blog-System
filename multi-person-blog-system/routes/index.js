var express = require('express')
var router = express.Router()

let userLogin = require('./login/userLogin')
let article = require('./article/article')
let file = require('./file/file')

/* 用户发送验证码 */
router.post('/user/sendMail', userLogin.sendMail)

/* 用户登录 */
router.post('/user/login', userLogin.userLogin)

/* 用户注册 */
router.post('/user/register', userLogin.userRegister)

/* 判断用户是否在登录状态 */
router.post('/user/isLogined', userLogin.userIsLogined)

/* 用户退出登录 */
router.post('/user/signout', userLogin.userExit)

/* 获取分类 */
router.get('/article/category', article.getCategory)

/* 获取标签 */
router.get('/article/label', article.getLabel)

/* 文章发布 */
router.post('/article/publish', article.articlePublish)

/* 文章修改 */
router.post('/article/updata', article.updataArticle);

/* 查询文章数量 */
router.get('/article/getArticlesCount', article.getArticlesCount);

/* 文章查询 */
router.get('/article/getArticle',article.getArticle) 

/* 详情查询 */
router.get('/article/detail',article.getArticleDetail) 

/* 文章封面图 */
router.post('/article/images', file.upload.single('images'),file.uploadCallBack);

/* 删除图片 */
router.post('/removeFile', file.removeFile);

/* 审核文章 */
router.post('/article/reviewed', article.reviewedArticle);

/* 留言 */
router.post('/comment/leaveComment', article.leaveComment);

/* 获取留言 */
router.get('/comment/getComment', article.getComment);



module.exports = router
