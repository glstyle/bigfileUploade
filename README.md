
const fs = require('fs');

const content = `# 大文件上传服务 - 使用说明文档

## 目录结构
```
project/
├── server.js      # 服务器端代码
├── index.html     # 测试用前端页面
├── uploads/       # 文件上传目录（自动创建）
├── package.json   # 项目配置文件
└── README.md      # 说明文档
```

## 1. 环境要求
- Node.js (建议 v14.0.0 或更高版本)
- npm (Node.js 包管理器)

## 2. 安装步骤

### 2.1 创建项目
```bash
# 创建项目目录
mkdir file-upload-server
cd file-upload-server

# 初始化 npm 项目
npm init -y
```

### 2.2 安装依赖
```bash
npm install express multer
```

## 3. 配置说明

### 3.1 服务器配置 (server.js)
- 默认端口：3000
- 上传文件大小限制：100MB
- 上传目录：`./uploads/`

可修改的主要配置项：
```javascript
const port = 3000;  // 修改服务器端口

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 100  // 修改文件大小限制
    }
});
```

## 4. 启动服务

```bash
# 启动服务器
node server.js
```

成功启动后，将看到以下提示

``` 
服务器运行在 http://localhost:3000
```

## 5. API 文档

### 5.1 文件上传接口

- **URL**: `/upload`
- **方法**: POST
- **Content-Type**: multipart/form-data
- **参数**:
  - `file`: 文件对象

#### 请求示例
```javascript
const formData = new FormData();
formData.append('file', fileObject);

fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData
})
```

#### 响应格式
成功响应：
```json
{
    "message": "文件上传成功",
    "filename": "1234567890-example.jpg",
    "size": 1234567
}
```

错误响应：
```json
{
    "message": "文件上传失败",
    "error": "错误详情"
}
```

## 6. 错误处理

服务器会处理以下错误情况：
- 文件大小超过限制
- 未选择文件
- 服务器存储错误

## 7. 测试方法

1. 启动服务器
2. 在浏览器中打开 index.html
3. 选择文件并点击上传按钮
4. 查看上传结果

## 8. 注意事项

1. 生产环境部署时建议：
   - 添加适当的安全措施（如文件类型验证）
   - 配置跨域访问控制
   - 添加用户认证
   - 实现文件上传进度显示

2. 性能优化建议：
   - 对于超大文件，建议实现分片上传
   - 添加文件 MD5 校验
   - 实现断点续传功能

## 9. 常见问题

1. **上传失败**
   - 检查文件大小是否超过限制
   - 确保 uploads 目录具有写入权限
   - 检查服务器磁盘空间是否充足

2. **无法连接服务器**
   - 确认服务器是否正在运行
   - 检查端口是否被占用
   - 验证防火墙设置

## 10. 更新日志

### v1.0.0
- 基础文件上传功能
- 文件大小限制
- 简单的错误处理
- 测试用前端界面

## 11. 联系与支持

如有问题或建议，请提交 Issue 或 Pull Request。

## 12. 许可证

MIT License`;

``` js
fs.writeFile('README.md', content, 'utf8', (err) => {
    if (err) {
        console.error('创建 README.md 文件时发生错误:', err);
        return;
    }
    console.log('README.md 文件已成功创建！');
});
```