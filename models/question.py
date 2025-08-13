# -*- coding: utf-8 -*-
import json
import logging
from datetime import datetime
from .database import db

logger = logging.getLogger(__name__)

class Question:
    def __init__(self):
        """题目模型类"""
        pass
    
    @staticmethod
    def save_questions(questions, created_by=1):
        """
        保存题目到数据库
        
        Args:
            questions: 题目列表
            created_by: 创建者ID（教师ID）
        
        Returns:
            dict: 保存结果
        """
        print(f"\n💾 保存{len(questions)}道题目到数据库")
        print(f"  创建者ID: {created_by}")
        
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            saved_ids = []
            
            for i, question in enumerate(questions):
                print(f"  保存题目{i+1}: {question.get('title', 'N/A')}")
                
                # 处理选项（转换为JSON字符串）
                options_json = None
                if question.get('options'):
                    options_json = json.dumps(question['options'], ensure_ascii=False)
                
                cursor.execute('''
                    INSERT INTO questions (
                        title, content, type, difficulty, subject, grade,
                        options, correct_answer, explanation, knowledge_points, created_by
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    question.get('title', ''),
                    question.get('content', ''),
                    question.get('type', 'choice'),
                    question.get('difficulty', 3),
                    question.get('subject', ''),
                    question.get('grade', ''),
                    options_json,
                    question.get('correct_answer') or question.get('reference_answer') or question.get('final_answer', ''),
                    question.get('explanation') or question.get('solution_steps', ''),
                    question.get('knowledge_points', ''),
                    created_by
                ))
                
                saved_ids.append(cursor.lastrowid)
            
            conn.commit()
            conn.close()
            
            print(f"✅ 题目保存成功，IDs: {saved_ids}")
            
            return {
                'success': True,
                'question_ids': saved_ids,
                'message': f'成功保存{len(questions)}道题目'
            }
            
        except Exception as e:
            print(f"❌ 题目保存失败: {str(e)}")
            logger.error(f"保存题目失败: {str(e)}")
            return {
                'success': False,
                'message': f'保存失败: {str(e)}'
            }
    
    @staticmethod
    def get_question_by_id(question_id):
        """根据ID获取题目"""
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM questions WHERE id = ?', (question_id,))
            row = cursor.fetchone()
            conn.close()
            
            if row:
                question = dict(row)
                # 解析JSON格式的选项
                if question['options']:
                    try:
                        question['options'] = json.loads(question['options'])
                    except:
                        question['options'] = []
                return question
            
            return None
            
        except Exception as e:
            logger.error(f"获取题目失败: {str(e)}")
            return None
    
    @staticmethod
    def get_questions_by_teacher(teacher_id, limit=50):
        """获取教师创建的题目列表"""
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM questions 
                WHERE created_by = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            ''', (teacher_id, limit))
            
            rows = cursor.fetchall()
            conn.close()
            
            questions = []
            for row in rows:
                question = dict(row)
                # 解析JSON格式的选项
                if question['options']:
                    try:
                        question['options'] = json.loads(question['options'])
                    except:
                        question['options'] = []
                questions.append(question)
            
            return questions
            
        except Exception as e:
            logger.error(f"获取教师题目列表失败: {str(e)}")
            return []
