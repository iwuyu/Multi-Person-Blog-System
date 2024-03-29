var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
var cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");


var app = express();

let server = require('http').Server(app)
var io = require('socket.io')(server,{cors:true});
server.listen(8081)
require('./routes/utils/socketIO')(io)

// io.on('connection', (socket) => {
//   console.log('一个用户链接成功');
//   socket.emit('hi',)
// });

// session 生成
app.use(
  session({
    secret: "dsakljfldkjflkjgfdjg", //密钥
    cookie: { maxAge: 60 * 1000 * 120 }, //过期时间两小时
    resave: true,
    saveUninitialized: true,
  })
);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));

/* 跨域 开发模式 */
app.use(
  cors({
    origin: ["http://192.168.37.30:8080", "http://localhost:8080"],
    credentials: true,
  }
  )
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
