const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// 配置文件存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 文件将被保存在 uploads 目录
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成文件名: 时间戳 + 原始文件名
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// 创建 multer 实例
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 100 // 限制文件大小为100MB
    }
});

// 添加CORS中间件
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// 处理文件上传的路由
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '没有文件被上传' });
        }

        // 检查必要的参数
        if (!req.body.chunkIndex || !req.body.chunks || !req.body.filename) {
            return res.status(400).json({ message: '缺少必要的参数' });
        }

        const chunkIndex = parseInt(req.body.chunkIndex);
        const totalChunks = parseInt(req.body.chunks);
        const originalFilename = req.body.filename;

        // 验证参数合法性
        if (isNaN(chunkIndex) || isNaN(totalChunks)) {
            return res.status(400).json({ message: '参数格式不正确' });
        }

        const chunkDir = path.join('uploads', 'chunks', originalFilename);
        
        try {
            // 创建临时切片存储目录
            if (!fs.existsSync(chunkDir)) {
                fs.mkdirSync(chunkDir, { recursive: true });
            }
        } catch (err) {
            return res.status(500).json({ message: '创建切片目录失败', error: err.message });
        }

        // 将切片移动到对应目录
        const chunkPath = path.join(chunkDir, `chunk-${chunkIndex}`);
        try {
            fs.renameSync(req.file.path, chunkPath);
        } catch (err) {
            return res.status(500).json({ message: '保存切片失败', error: err.message });
        }

        // 如果是最后一个切片，开始合并文件
        if (chunkIndex === totalChunks - 1) {
            const finalPath = path.join('uploads', originalFilename);
            const writeStream = fs.createWriteStream(finalPath);

            try {
                // 按顺序合并所有切片
                for (let i = 0; i < totalChunks; i++) {
                    const currentChunkPath = path.join(chunkDir, `chunk-${i}`);
                    if (!fs.existsSync(currentChunkPath)) {
                        throw new Error(`切片 ${i} 不存在`);
                    }
                    const chunkBuffer = fs.readFileSync(currentChunkPath);
                    writeStream.write(chunkBuffer);
                }

                // 等待所有数据写入完成
                await new Promise((resolve, reject) => {
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                    writeStream.end();
                });

                // 清理切片文件夹
                fs.rmSync(chunkDir, { recursive: true, force: true });

                res.json({
                    message: '文件上传并合并成功',
                    filename: originalFilename
                });
            } catch (err) {
                // 关闭写入流并删除不完整的文件
                writeStream.end();
                if (fs.existsSync(finalPath)) {
                    fs.unlinkSync(finalPath);
                }
                return res.status(500).json({ 
                    message: '文件合并失败', 
                    error: err.message,
                    details: '合并过程中发生错误，已清理临时文件'
                });
            }
        } else {
            res.json({
                message: '切片上传成功',
                currentChunk: chunkIndex,
                totalChunks: totalChunks
            });
        }
    } catch (error) {
        // 确保发生错误时清理临时文件
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ 
            message: '文件上传失败', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});
