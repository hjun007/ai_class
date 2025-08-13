# -*- coding: utf-8 -*-
import json
import logging
from openai import OpenAI
from config import Config

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        """初始化AI服务，配置DeepSeek API"""
        self.client = OpenAI(
            api_key=Config.API_KEY,
            base_url=Config.BASE_URL
        )
    
    def generate_questions(self, config):
        """
        根据配置生成题目
        
        Args:
            config (dict): 题目生成配置
                - subject: 科目
                - grade: 年级
                - question_type: 题目类型
                - difficulty: 难度等级 (1-5)
                - question_count: 生成数量
                - knowledge_points: 知识点
                - custom_requirements: 自定义要求
        
        Returns:
            list: 生成的题目列表
        """
        print("\n" + "="*50)
        print("🤖 AI SERVICE DEBUG - 开始生成题目")
        print("="*50)
        print(f"📋 接收到的配置: {config}")
        
        try:
            # 构建提示词
            print("\n🔧 步骤1: 构建提示词")
            prompt = self._build_prompt(config)
            print(f"✅ 提示词构建完成，长度: {len(prompt)} 字符")
            print(f"📝 提示词前200字符: {prompt[:200]}...")
            logger.info(f"生成题目提示词: {prompt[:200]}...")
            
            # 调用DeepSeek API
            print("\n🌐 步骤2: 调用DeepSeek API")
            print(f"🔑 API Key: {Config.API_KEY[:20]}...{Config.API_KEY[-10:]}")
            print(f"🌍 Base URL: {Config.BASE_URL}")
            print("📡 正在发送请求...")
            
            response = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {
                        "role": "system", 
                        "content": "你是一位专业的教师，擅长出题。请严格按照用户要求生成题目，并以JSON格式返回。"
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=4000
            )
            
            print("✅ API调用成功!")
            print(f"📊 响应状态: {response}")
            
            # 解析响应
            print("\n📖 步骤3: 解析API响应")
            content = response.choices[0].message.content
            print(f"📄 响应内容长度: {len(content)} 字符")
            print(f"📝 响应内容前500字符:")
            print("-" * 30)
            print(content[:500])
            print("-" * 30)
            logger.info(f"AI响应内容: {content[:200]}...")
            
            # 尝试解析JSON
            print("\n🔍 步骤4: 解析JSON数据")
            questions = self._parse_ai_response(content)
            print(f"✅ JSON解析成功，获得题目数量: {len(questions)}")
            
            if questions:
                print("📋 题目预览:")
                for i, q in enumerate(questions[:2]):  # 只显示前2道题目
                    print(f"  题目{i+1}: {q.get('title', 'N/A')}")
                    print(f"  类型: {q.get('type', 'N/A')}")
                    print(f"  内容: {q.get('content', 'N/A')[:50]}...")
            
            result = {
                'success': True,
                'questions': questions,
                'message': f'成功生成{len(questions)}道题目'
            }
            
            print(f"\n🎉 生成完成! 返回结果: success={result['success']}, 题目数={len(result['questions'])}")
            print("="*50)
            
            return result
            
        except Exception as e:
            print(f"\n❌ 生成失败!")
            print(f"🐛 错误类型: {type(e).__name__}")
            print(f"📝 错误信息: {str(e)}")
            print(f"📍 错误位置: {e.__class__.__module__}")
            import traceback
            print(f"🔍 完整错误堆栈:")
            traceback.print_exc()
            print("="*50)
            
            logger.error(f"生成题目失败: {str(e)}")
            return {
                'success': False,
                'questions': [],
                'message': f'生成失败: {str(e)}'
            }
    
    def _build_prompt(self, config):
        """构建AI生成题目的提示词"""
        
        # 科目映射
        subject_map = {
            'math': '数学',
            'chinese': '语文',
            'english': '英语',
            'physics': '物理',
            'chemistry': '化学',
            'biology': '生物',
            'history': '历史',
            'geography': '地理',
            'information': '信息技术'
        }
        
        # 年级映射
        grade_map = {
            'grade1': '一年级',
            'grade2': '二年级',
            'grade3': '三年级',
            'grade4': '四年级',
            'grade5': '五年级',
            'grade6': '六年级',
            'grade7': '七年级',
            'grade8': '八年级',
            'grade9': '九年级'
        }
        
        # 题目类型映射
        type_map = {
            'choice': '选择题',
            'fill': '填空题',
            'essay': '简答题',
            'calculation': '计算题'
        }
        
        # 难度等级映射
        difficulty_map = {
            1: '简单',
            2: '较简单',
            3: '普通',
            4: '较困难',
            5: '困难'
        }
        
        subject = subject_map.get(config.get('subject', ''), '数学')
        grade = grade_map.get(config.get('grade', ''), '三年级')
        question_type = type_map.get(config.get('question_type', ''), '选择题')
        difficulty = difficulty_map.get(int(config.get('difficulty', 3)), '普通')
        question_count = int(config.get('question_count', 5))
        knowledge_points = config.get('knowledge_points', '').strip()
        custom_requirements = config.get('custom_requirements', '').strip()
        
        prompt = f"""请为{grade}{subject}生成{question_count}道{question_type}，难度等级为{difficulty}。

要求：
1. 题目内容要符合{grade}学生的认知水平
2. 难度等级：{difficulty}
3. 题目类型：{question_type}
"""
        
        if knowledge_points:
            prompt += f"4. 涉及知识点：{knowledge_points}\n"
        
        if custom_requirements:
            prompt += f"5. 特殊要求：{custom_requirements}\n"
        
        # 根据题目类型添加特定要求
        if question_type == '选择题':
            prompt += """
请严格按照以下JSON格式返回（不要添加任何其他文字）：
{
  "questions": [
    {
      "id": 1,
      "type": "choice",
      "title": "题目标题",
      "content": "题目内容描述",
      "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
      "correct_answer": "A",
      "explanation": "答案解析"
    }
  ]
}
"""
        elif question_type == '填空题':
            prompt += """
请严格按照以下JSON格式返回（不要添加任何其他文字）：
{
  "questions": [
    {
      "id": 1,
      "type": "fill",
      "title": "题目标题",
      "content": "题目内容，用______表示填空位置",
      "correct_answer": "正确答案",
      "explanation": "答案解析"
    }
  ]
}
"""
        elif question_type == '简答题':
            prompt += """
请严格按照以下JSON格式返回（不要添加任何其他文字）：
{
  "questions": [
    {
      "id": 1,
      "type": "essay",
      "title": "题目标题",
      "content": "题目内容描述",
      "reference_answer": "参考答案要点",
      "explanation": "解题思路"
    }
  ]
}
"""
        else:  # 计算题
            prompt += """
请严格按照以下JSON格式返回（不要添加任何其他文字）：
{
  "questions": [
    {
      "id": 1,
      "type": "calculation",
      "title": "题目标题",
      "content": "题目内容描述",
      "solution_steps": "详细解题步骤",
      "final_answer": "最终答案",
      "explanation": "解题思路"
    }
  ]
}
"""
        
        return prompt
    
    def _parse_ai_response(self, content):
        """解析AI响应内容"""
        print("\n🔍 JSON解析DEBUG:")
        print(f"📄 原始内容长度: {len(content)}")
        print(f"📝 内容是否以{{开头: {content.strip().startswith('{')}")
        
        try:
            # 尝试直接解析JSON
            if content.strip().startswith('{'):
                print("✅ 内容以{开头，尝试直接解析JSON")
                data = json.loads(content)
                print(f"✅ JSON解析成功! 数据类型: {type(data)}")
                print(f"📋 数据键: {list(data.keys()) if isinstance(data, dict) else 'N/A'}")
                questions = data.get('questions', [])
                print(f"📝 提取到的题目数量: {len(questions)}")
                return questions
            
            # 如果响应包含其他文字，尝试提取JSON部分
            print("🔍 内容不以{开头，尝试提取JSON部分")
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                print(f"✅ 找到JSON片段，长度: {len(json_str)}")
                print(f"📝 JSON片段前100字符: {json_str[:100]}")
                data = json.loads(json_str)
                print(f"✅ JSON片段解析成功!")
                questions = data.get('questions', [])
                print(f"📝 提取到的题目数量: {len(questions)}")
                return questions
            
            # 如果无法解析JSON，返回空列表
            print("❌ 未找到有效的JSON内容")
            logger.warning("无法解析AI响应为JSON格式")
            return []
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON解析错误!")
            print(f"🐛 错误信息: {str(e)}")
            print(f"📍 错误位置: 第{e.lineno}行，第{e.colno}列")
            print(f"📝 错误附近内容: {e.doc[max(0, e.pos-50):e.pos+50] if hasattr(e, 'doc') and e.doc else 'N/A'}")
            logger.error(f"JSON解析错误: {str(e)}")
            # 返回一个示例题目作为后备
            print("🔄 使用后备题目")
            return self._get_fallback_questions()
    
    def _get_fallback_questions(self):
        """当AI生成失败时返回的后备题目"""
        return [
            {
                "id": 1,
                "type": "choice",
                "title": "示例题目",
                "content": "这是一道示例题目，AI生成失败时的后备内容。",
                "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
                "correct_answer": "A",
                "explanation": "这是示例解析。"
            }
        ]

# 创建全局AI服务实例
ai_service = AIService()
