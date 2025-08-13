# Flask项目 - 标准结构

一个使用标准Flask项目结构的Web应用。

## 项目结构

```
ai_class/
├── app.py                    # 主应用文件
├── config.py                 # 配置文件
├── requirements.txt          # 依赖文件
├── README.md                # 说明文档
├── routes/                  # 路由模块
│   ├── __init__.py          # 蓝图初始化
│   └── pages.py             # 页面路由
├── templates/               # 模板文件
│   └── home.html            # 主页模板
├── static/                  # 静态文件
│   ├── css/
│   │   └── style.css        # 样式文件
│   └── js/
│       └── main.js          # JavaScript文件
└── .venv/                   # 虚拟环境
```

## 功能特点

- 标准Flask项目结构
- 蓝图模块化路由
- 分离的配置文件
- 响应式设计
- 现代化UI界面
- 交互式功能

## 运行方法

1. 激活虚拟环境：
   ```bash
   .venv\\Scripts\\activate
   ```

2. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

3. 运行应用：
   ```bash
   python app.py
   ```

4. 访问地址：
   ```
   http://127.0.0.1:5000
   ```

## 技术栈

- Python 3.x
- Flask 3.1.1
- HTML5
- CSS3
- JavaScript
- Flask Blueprints
