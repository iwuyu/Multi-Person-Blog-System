const multer = require('multer')
const Jwt = require("../utils/jsonwebtoken")
const fs = require('fs')

// 上传文件
var storage = multer.diskStorage({
  // 设置上传后文件路径，
  destination: function(req,file,cb) {
      cb(null,`./public/${file.fieldname}`)
  },
  // 给上传的文件重命名，获取添加后缀名
  filename: function(req,file,cb) {
    let fileFormats = file.originalname.split("."); // 获取后缀名
    let fileFormat = fileFormats[fileFormats.length - 1];
    let fileName = (new Date()).getTime() + parseInt(Math.random() * 9999); // 随机生成文件名
    // 给图片加上时间戳格式防止重命名
    cb(null,`${fileName}.${fileFormat}`);
  }
});

let upload = multer({
  storage:storage
});

// 上传错误操作 删除
let fileDelete = filepath => {
  fs.unlink(`./${filepath}`, err => {
    if(err){
      console.log(err)
    }else{
      console.log('删除成功')
    }
  })
}

// 上传封面图/文章图/素材图 回调
uploadCallBack = (req,res) => {
  let {size,mimetype,path} = req.file;
  console.log(req.file)
  let types = ['jpg','jpeg','png','gif']; // 允许上传的数据类型
  let temType = mimetype.split('/')[1];
  if(size > 500 * 1024){
    fileDelete(req.file.path)
    return res.json({ 
      statusCode: 402, 
      message: "尺寸过大" 
    });
  }else if(types.indexOf(temType) == -1){
    fileDelete(req.file.path)
    return res.json({ 
      statusCode: 401, 
      message: "文件类型错误,仅支持'jpg','jpeg','png','gif'" 
    });
  }else if(req.file.fieldname == 'images') {
    let url = `/public/images/${req.file.filename}`
    return res.json({ 
      statusCode: 200, 
      message: "上传成功",
      data:url
    });
  }else if(req.file.fieldname == 'articleImages') {
    let url = `/public/articleImages/${req.file.filename}`
    return res.json({ 
      statusCode: 200, 
      message: "上传成功",
      data:url
    });
  }else if(req.file.fieldname == 'letterImage') {
    let url = `/public/letterImage/${req.file.filename}`
    return res.json({ 
      statusCode: 200, 
      message: "上传成功",
      data:url
    });
  }else {
    fileDelete(req.file.path)
    return res.json({ 
      statusCode: 400, 
      message: "上传失败" 
    });
  }
}

// 移出文件
removeFile = (req,res) => {
  const { filePath } = req.body;
  fileDelete(filePath)
  return res.json({ 
    statusCode: 200, 
    message: "移除成功"
  });
}

module.exports = {
  upload,
  uploadCallBack,
  removeFile
}