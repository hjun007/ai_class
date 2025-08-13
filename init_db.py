# 创建数据库初始化脚本
# init_db.py
import sqlite3
from config import Config

def init_database():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    cursor = conn.cursor()
    
    # 创建学生表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            class_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 创建题目表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            type TEXT NOT NULL, -- 'choice', 'fill', 'essay'
            difficulty INTEGER DEFAULT 1, -- 1-5
            subject TEXT,
            options TEXT, -- JSON格式存储选项
            correct_answer TEXT,
            explanation TEXT,
            created_by INTEGER, -- 教师ID
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 创建答题记录表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS answer_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            question_id INTEGER,
            answer TEXT,
            is_correct BOOLEAN,
            answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students (id),
            FOREIGN KEY (question_id) REFERENCES questions (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("数据库初始化完成！")