var express = require('express')
var router = express.Router()

let userLogin = require('./login/userLogin')
let login = require('./login/login')
let article = require('./article/article')
let question = require('./question/question')
let user = require('./user/user')
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

/* 管理员登录 */
router.post('/admin/login', login.adminLogin)

/* 验证管理员是否登录 */
router.get('/admin/adminIsLogined', login.adminIsLogined);

/* 退出管理系统 */
router.get('/admin/exit', login.adminExit);

/* 获取分类 */
router.get('/article/category', article.getCategory)

/* 获取标签 */
router.get('/article/label', article.getLabel)

/* 文章发布 */
router.post('/article/publish', article.articlePublish)

/* 文章修改 */
router.post('/article/updata', article.updataArticle);

/* 文章删除 */
router.post('/article/delete', article.deleteArticle);

/* 查询文章数量 */
router.get('/article/getArticlesCount', article.getArticlesCount);

/* 文章查询 */
router.get('/article/getArticle',article.getArticle) 

/* 详情查询 */
router.get('/article/detail',article.getArticleDetail) 

/* 文章封面图 */
router.post('/article/images', file.upload.single('images'),file.uploadCallBack);

/* 文章内容图 */
router.post('/article/articleImages', file.upload.single('articleImages'),file.uploadCallBack);

/* 删除图片 */
router.post('/removeFile', file.removeFile);

/* 审核文章 */
router.post('/article/reviewed', article.reviewedArticle);

/* 文章点赞 */
router.post('/article/like', article.articleLike);

/* 留言 */
router.post('/comment/leaveComment', article.leaveComment);

/* 删除留言 */
router.post('/comment/deteleComment', article.deteleComment);

/* 判断是否有留言 */
router.get('/comment/hasComment', article.hasComment);

/* 获取留言 */
router.get('/comment/getComment', article.getComment);

/* 查询所有用户 */ 
router.get('/getUsers', user.getUsers);

/* 修改用户禁言状态 */ 
router.post('/changeStatus', user.changeStatus);

/* 个人信息 */ 
router.get('/getUserInfo', user.getUserInfo);

/* 获取问答标签 */ 
router.get('/question/getQuestionlabel', question.getQuestionLabel);

/* 问答发布 */ 
router.post('/question/publish', question.questionPublish);

/* 问答删除 */ 
router.post('/question/delete', question.deleteQuestion);

/* 获取问答 */ 
router.get('/question/getQuestion', question.getQuestion);

/* 获取问答数量 */ 
router.get('/question/getquestionsCount', question.getquestionsCount);

/* 获取问答详情 */ 
router.get('/question/getQuestionDetail', question.getQuestionDetail);

/* 文章点赞 */
router.post('/question/like', question.questionLike);

/* 个人信息 */ 
router.get('/getOtherInfo', user.getOtherInfo);

module.exports = router
