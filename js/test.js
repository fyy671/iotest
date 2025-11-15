var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');

const connect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'csk'
});
// 手动连接数据库（确保连接已建立）
connect.connect(err => {
    if (err) {
        console.error('数据库连接失败：', err.message);
        return;
    }
    console.log('数据库连接成功');
});
async function Search(text) {
   return new Promise((resolve, reject) => {
        // 从 tj 表中查询所有字段，条件是 description 包含 keyword
        const sql = "SELECT * FROM tj WHERE description LIKE ?";
        // 参数：用 % 包裹关键词，实现模糊匹配（% 表示任意字符）
        const params = [`%${text}%`]; 
        connect.query(sql, params, (err, result) => {
            if (err) {
                console.error('查找失败：', err.message);
                reject(err);
                return;
            }
            console.log('查询成功，匹配记录数：', result.length);
            resolve(result); // 返回查询结果（数组，包含所有匹配的记录）
        });
    });
}
//插入一条数据；
async function insertUser(description, image, text, type, word) {
    return new Promise((resolve, reject) => {
        /*return new Promise((resolve, reject)
        是 JavaScript 中用于将异步操作封装为 Promise 对象的核心语法，目的是让异步代码（比如数据库操作、文件读写、网络请求）可以用更清晰的方式处理成功 / 失败的结果，避免回调嵌套（“回调地狱”）。
        */
        // SQL 语句：插入到 bug 表的四个字段
        const sql = 'INSERT INTO  tj(description, image, text, type, word) VALUES (?, ?, ?, ?, ?)';
        // 参数数组：按顺序对应四个字段的值
        const params = [description, image, text, type, word];
        // 使用 connect.query 执行插入
        connect.query(sql, params, (err, result) => {
            if (err) {
                console.error('插入失败：', err.message);
                reject(err); // 出错时 reject
                return;
            }
            console.log('插入成功,内容为：' + image + text + type + word);
            resolve(result); // 成功时返回结果
        });
    });
}
//创建Web服务器
const app = express();
//cors跨域共享资源

// 关键：添加这行代码，解析 JSON 格式的请求体
app.use(express.json());
app.use(require('cors')());
app.use(express.static(path.join(__dirname, 'public')));
//静态资源访问服务功能
//path.join()用于把多个路径片段拼接成一个完整的路径字符串
app.use(express.static(path.join(__dirname, 'public')))
//对应get
app.get('/search', (req, res) => {
    const { text } = req.query; // 从 URL 参数中获取 text（关键词）
    console.log('查询关键词：', text);
    if (!text) {
        return res.json({ code: 400, msg: '查询关键词不能为空' });
    }
    Search(text) // 调用 Search 函数，传递关键词
        .then(result => {
            res.json({
                code: 200,
                msg: '查询成功',
                count: result.length, // 匹配的记录数
                data: result // 匹配的完整记录
            });
        })
        .catch(err => {
            res.json({
                code: 500,
                msg: '查询失败：' + err.message
            });
        });
})
//对应insert
app.post('/insert', (req, res) => {
    console.log('后端接收的参数：', req.body); // 关键！打印 req.body 看是否有值
    const { description, image, text, type, word } = req.body;
    console.log('解构后的值：', { description, image, text, type, word }); // 确认解构是否正确
    insertUser(description, image, text, type, word).then(rsp => {
        res.json({
            code: 200,
            msg: "插入成功",
            result: { description, image, text, type, word }
        });
    });
})
//监听端口
app.listen(3000);
console.log('服务器启动成功,port:3000');


