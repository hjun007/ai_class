# -*- coding: utf-8 -*-
import json
import logging
from datetime import datetime
from .database import db

logger = logging.getLogger(__name__)

class Paper:
    def __init__(self):
        """试卷模型类"""
        pass
    
    @staticmethod
    def create_paper(title, description, subject, grade, created_by, time_limit=60):
        """
        创建新试卷
        
        Args:
            title: 试卷标题
            description: 试卷描述
            subject: 科目
            grade: 年级
            created_by: 创建者ID（教师ID）
            time_limit: 时间限制（分钟）
        
        Returns:
            dict: 创建结果
        """
        print(f"\n📝 创建试卷: {title}")
        print(f"  科目: {subject}, 年级: {grade}")
        print(f"  创建者: {created_by}, 时间限制: {time_limit}分钟")
        
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO papers (title, description, subject, grade, time_limit, created_by)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (title, description, subject, grade, time_limit, created_by))
            
            paper_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            print(f"✅ 试卷创建成功，ID: {paper_id}")
            
            return {
                'success': True,
                'paper_id': paper_id,
                'message': f'试卷"{title}"创建成功'
            }
            
        except Exception as e:
            print(f"❌ 试卷创建失败: {str(e)}")
            logger.error(f"创建试卷失败: {str(e)}")
            return {
                'success': False,
                'message': f'创建失败: {str(e)}'
            }
    
    @staticmethod
    def get_paper_by_id(paper_id):
        """根据ID获取试卷信息"""
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM papers WHERE id = ?
            ''', (paper_id,))
            
            row = cursor.fetchone()
            conn.close()
            
            if row:
                return dict(row)
            return None
            
        except Exception as e:
            logger.error(f"获取试卷失败: {str(e)}")
            return None
    
    @staticmethod
    def get_papers_by_teacher(teacher_id):
        """获取教师创建的所有试卷"""
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT p.*, COUNT(pq.question_id) as question_count
                FROM papers p
                LEFT JOIN paper_questions pq ON p.id = pq.paper_id
                WHERE p.created_by = ?
                GROUP BY p.id
                ORDER BY p.created_at DESC
            ''', (teacher_id,))
            
            rows = cursor.fetchall()
            conn.close()
            
            return [dict(row) for row in rows]
            
        except Exception as e:
            logger.error(f"获取教师试卷列表失败: {str(e)}")
            return []
    
    @staticmethod
    def add_question_to_paper(paper_id, question_id, score=10):
        """
        向试卷添加题目
        
        Args:
            paper_id: 试卷ID
            question_id: 题目ID
            score: 题目分值
        
        Returns:
            dict: 添加结果
        """
        print(f"\n📝 向试卷{paper_id}添加题目{question_id}")
        print(f"  分值: {score}")
        
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            # 检查试卷是否存在
            cursor.execute('SELECT id FROM papers WHERE id = ?', (paper_id,))
            if not cursor.fetchone():
                return {'success': False, 'message': '试卷不存在'}
            
            # 获取当前试卷中题目的最大顺序号
            cursor.execute('''
                SELECT MAX(question_order) FROM paper_questions WHERE paper_id = ?
            ''', (paper_id,))
            result = cursor.fetchone()
            max_order = result[0] if result[0] else 0
            
            # 添加题目到试卷
            cursor.execute('''
                INSERT INTO paper_questions (paper_id, question_id, question_order, score)
                VALUES (?, ?, ?, ?)
            ''', (paper_id, question_id, max_order + 1, score))
            
            conn.commit()
            conn.close()
            
            print(f"✅ 题目添加成功，顺序: {max_order + 1}")
            
            return {
                'success': True,
                'message': '题目添加成功'
            }
            
        except Exception as e:
            print(f"❌ 添加题目失败: {str(e)}")
            logger.error(f"添加题目到试卷失败: {str(e)}")
            return {
                'success': False,
                'message': f'添加失败: {str(e)}'
            }
    
    @staticmethod
    def get_paper_questions(paper_id):
        """获取试卷中的所有题目"""
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT q.*, pq.score, pq.question_order
                FROM questions q
                JOIN paper_questions pq ON q.id = pq.question_id
                WHERE pq.paper_id = ?
                ORDER BY pq.question_order
            ''', (paper_id,))
            
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
            logger.error(f"获取试卷题目失败: {str(e)}")
            return []
    
    @staticmethod
    def publish_paper(paper_id):
        """
        发布试卷
        
        Args:
            paper_id: 试卷ID
        
        Returns:
            dict: 发布结果
        """
        print(f"\n📢 发布试卷: {paper_id}")
        
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            # 检查试卷是否存在
            cursor.execute('SELECT * FROM papers WHERE id = ?', (paper_id,))
            paper = cursor.fetchone()
            if not paper:
                return {'success': False, 'message': '试卷不存在'}
            
            # 检查试卷是否有题目
            cursor.execute('SELECT COUNT(*) FROM paper_questions WHERE paper_id = ?', (paper_id,))
            question_count = cursor.fetchone()[0]
            if question_count == 0:
                return {'success': False, 'message': '试卷中没有题目，无法发布'}
            
            # 更新试卷状态为已发布
            cursor.execute('''
                UPDATE papers 
                SET status = 'published', published_at = ?
                WHERE id = ?
            ''', (datetime.now().isoformat(), paper_id))
            
            conn.commit()
            conn.close()
            
            print(f"✅ 试卷发布成功，包含{question_count}道题目")
            
            return {
                'success': True,
                'message': f'试卷发布成功，包含{question_count}道题目'
            }
            
        except Exception as e:
            print(f"❌ 试卷发布失败: {str(e)}")
            logger.error(f"发布试卷失败: {str(e)}")
            return {
                'success': False,
                'message': f'发布失败: {str(e)}'
            }
    
    @staticmethod
    def delete_paper(paper_id):
        """删除试卷"""
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            # 删除试卷题目关联
            cursor.execute('DELETE FROM paper_questions WHERE paper_id = ?', (paper_id,))
            
            # 删除试卷
            cursor.execute('DELETE FROM papers WHERE id = ?', (paper_id,))
            
            conn.commit()
            conn.close()
            
            return {'success': True, 'message': '试卷删除成功'}
            
        except Exception as e:
            logger.error(f"删除试卷失败: {str(e)}")
            return {'success': False, 'message': f'删除失败: {str(e)}'}
    
    @staticmethod
    def remove_question_from_paper(paper_id, question_id):
        """从试卷中移除题目"""
        try:
            conn = db.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                DELETE FROM paper_questions 
                WHERE paper_id = ? AND question_id = ?
            ''', (paper_id, question_id))
            
            conn.commit()
            conn.close()
            
            return {'success': True, 'message': '题目移除成功'}
            
        except Exception as e:
            logger.error(f"移除题目失败: {str(e)}")
            return {'success': False, 'message': f'移除失败: {str(e)}'}
