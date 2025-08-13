# -*- coding: utf-8 -*-
import sqlite3
import json
import logging
from datetime import datetime
from config import Config

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        """初始化数据库连接"""
        self.db_path = Config.DATABASE_PATH
        self.init_database()
    
    def get_connection(self):
        """获取数据库连接"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # 使用Row工厂，支持字典式访问
        return conn
    
    def init_database(self):
        """初始化数据库表"""
        print("\n🗄️ DATABASE DEBUG - 初始化数据库")
        print("="*50)
        
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # 创建教师表
            print("📋 创建教师表...")
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS teachers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 创建学生表
            print("📋 创建学生表...")
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
            print("📋 创建题目表...")
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS questions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    type TEXT NOT NULL, -- 'choice', 'fill', 'essay', 'calculation'
                    difficulty INTEGER DEFAULT 3, -- 1-5
                    subject TEXT,
                    grade TEXT,
                    options TEXT, -- JSON格式存储选项
                    correct_answer TEXT,
                    explanation TEXT,
                    knowledge_points TEXT,
                    created_by INTEGER, -- 教师ID
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES teachers (id)
                )
            ''')
            
            # 创建试卷表
            print("📋 创建试卷表...")
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS papers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    subject TEXT,
                    grade TEXT,
                    total_score INTEGER DEFAULT 100,
                    time_limit INTEGER, -- 考试时间限制（分钟）
                    status TEXT DEFAULT 'draft', -- 'draft', 'published', 'closed'
                    created_by INTEGER NOT NULL, -- 教师ID
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    published_at DATETIME,
                    FOREIGN KEY (created_by) REFERENCES teachers (id)
                )
            ''')
            
            # 创建试卷题目关联表
            print("📋 创建试卷题目关联表...")
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS paper_questions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    paper_id INTEGER NOT NULL,
                    question_id INTEGER NOT NULL,
                    question_order INTEGER NOT NULL, -- 题目在试卷中的顺序
                    score REAL DEFAULT 10, -- 该题目的分值
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (paper_id) REFERENCES papers (id),
                    FOREIGN KEY (question_id) REFERENCES questions (id),
                    UNIQUE(paper_id, question_id) -- 防止重复添加同一题目
                )
            ''')
            
            # 创建答题记录表
            print("📋 创建答题记录表...")
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS answer_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    paper_id INTEGER,
                    student_id INTEGER,
                    question_id INTEGER,
                    answer TEXT,
                    is_correct BOOLEAN,
                    score REAL DEFAULT 0,
                    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (paper_id) REFERENCES papers (id),
                    FOREIGN KEY (student_id) REFERENCES students (id),
                    FOREIGN KEY (question_id) REFERENCES questions (id)
                )
            ''')
            
            # 创建考试记录表
            print("📋 创建考试记录表...")
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS exam_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    paper_id INTEGER NOT NULL,
                    student_id INTEGER NOT NULL,
                    total_score REAL DEFAULT 0,
                    max_score REAL DEFAULT 100,
                    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'timeout'
                    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    completed_at DATETIME,
                    FOREIGN KEY (paper_id) REFERENCES papers (id),
                    FOREIGN KEY (student_id) REFERENCES students (id),
                    UNIQUE(paper_id, student_id) -- 每个学生每张试卷只能有一条记录
                )
            ''')
            
            conn.commit()
            conn.close()
            
            print("✅ 数据库表创建完成!")
            print("="*50)
            
        except Exception as e:
            print(f"❌ 数据库初始化失败: {str(e)}")
            logger.error(f"数据库初始化失败: {str(e)}")
            raise

# 创建全局数据库实例
db = Database()
