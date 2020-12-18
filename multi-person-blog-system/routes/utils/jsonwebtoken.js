const JWT = require("jsonwebtoken");
const secret = "kljskajdoewiioertiojreoitjoidjfgifdjg"; //设置一个私钥
function createToken(Payload) {
  return JWT.sign(Payload, secret, { expiresIn: '2h' }); //生成token
}
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    JWT.verify(token, secret, (err, data) => {
      if (err) reject({ err: -999, data: "无效的token" });
      else resolve({ err: 0, token: data });
    });
  });
}
function destroyToken(token) {
  return JWT.destroy(token)
}
module.exports = {
  createToken,
  verifyToken,
  destroyToken
};
