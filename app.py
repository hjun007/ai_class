# -*- coding: utf-8 -*-
from flask import Flask
from config import Config
from routes import main_bp
from routes.api import api_bp

def create_app():
    app = Flask(__name__)
    
    # 加载配置
    app.config.from_object(Config)
    
    # 初始化数据库
    print("🗄️ 初始化数据库...")
    from models.database import db
    print("✅ 数据库初始化完成")
    
    # 注册蓝图
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    
    return app

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 FLASK APP DEBUG - 应用启动")
    print("="*60)
    
    print("📋 步骤1: 创建Flask应用")
    app = create_app()
    print("✅ Flask应用创建完成")
    
    print("\n📋 步骤2: 检查配置")
    from config import Config
    print(f"🔑 API Key: {Config.API_KEY[:20]}...{Config.API_KEY[-10:]}")
    print(f"🌍 Base URL: {Config.BASE_URL}")
    print(f"🗄️ 数据库路径: {Config.DATABASE_PATH}")
    print(f"🐛 Debug模式: {Config.DEBUG}")
    print(f"🌐 Host: {Config.HOST}")
    print(f"🔌 Port: {Config.PORT}")
    
    print("\n📋 步骤3: 检查蓝图注册")
    print("📝 已注册的蓝图:")
    for blueprint_name, blueprint in app.blueprints.items():
        print(f"  - {blueprint_name}: {blueprint}")
    
    print("\n📋 步骤4: 检查路由")
    print("🛣️ 可用路由:")
    for rule in app.url_map.iter_rules():
        methods = ','.join(rule.methods - {'HEAD', 'OPTIONS'})
        print(f"  {methods:10} {rule.rule}")
    
    print("\n🚀 启动Flask开发服务器")
    print("🌐 访问地址: http://127.0.0.1:5000")
    print("🎯 智能出题: http://127.0.0.1:5000/teacher/create-question")
    print("🔧 API测试: http://127.0.0.1:5000/api/test")
    print("⚡ 按 Ctrl+C 停止服务器")
    print("="*60)
    
    app.run(debug=True, host='127.0.0.1', port=5000)
