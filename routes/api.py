# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from services.ai_service import ai_service
from models.paper import Paper
from models.question import Question
import logging

# 创建API蓝图
api_bp = Blueprint('api', __name__, url_prefix='/api')

# 配置日志
logger = logging.getLogger(__name__)

@api_bp.route('/generate-questions', methods=['POST'])
def generate_questions():
    """AI生成题目API"""
    print("\n" + "="*60)
    print("🌐 API DEBUG - 生成题目接口")
    print("="*60)
    
    try:
        # 获取请求数据
        print("📥 步骤1: 获取请求数据")
        data = request.get_json()
        print(f"📋 请求数据: {data}")
        print(f"📊 请求方法: {request.method}")
        print(f"🌍 请求URL: {request.url}")
        print(f"🔗 请求头: {dict(request.headers)}")
        
        if not data:
            print("❌ 请求数据为空!")
            return jsonify({
                'success': False,
                'message': '请求数据不能为空'
            }), 400
        
        # 验证必填字段
        print("\n🔍 步骤2: 验证必填字段")
        required_fields = ['subject', 'grade', 'question_type', 'question_count']
        for field in required_fields:
            field_value = data.get(field)
            print(f"  {field}: {field_value} {'✅' if field_value else '❌'}")
            if not field_value:
                print(f"❌ 缺少必填字段: {field}")
                return jsonify({
                    'success': False,
                    'message': f'缺少必填字段: {field}'
                }), 400
        
        # 验证题目数量
        print("\n🔢 步骤3: 验证题目数量")
        question_count = int(data.get('question_count', 5))
        print(f"📝 题目数量: {question_count}")
        if question_count < 1 or question_count > 20:
            print(f"❌ 题目数量超出范围: {question_count}")
            return jsonify({
                'success': False,
                'message': '题目数量应在1-20之间'
            }), 400
        print("✅ 题目数量验证通过")
        
        print(f"\n🚀 步骤4: 调用AI服务")
        logger.info(f"开始生成题目，配置: {data}")
        
        # 调用AI服务生成题目
        result = ai_service.generate_questions(data)
        print(f"🔄 AI服务返回结果: success={result.get('success')}")
        
        if result['success']:
            print(f"✅ 题目生成成功，数量: {len(result['questions'])}")
            logger.info(f"题目生成成功，数量: {len(result['questions'])}")
            print("="*60)
            return jsonify(result)
        else:
            print(f"❌ 题目生成失败: {result['message']}")
            logger.error(f"题目生成失败: {result['message']}")
            print("="*60)
            return jsonify(result), 500
            
    except ValueError as e:
        print(f"❌ 参数错误!")
        print(f"🐛 错误信息: {str(e)}")
        print("="*60)
        return jsonify({
            'success': False,
            'message': f'参数错误: {str(e)}'
        }), 400
    except Exception as e:
        print(f"❌ API异常!")
        print(f"🐛 错误类型: {type(e).__name__}")
        print(f"📝 错误信息: {str(e)}")
        import traceback
        print("🔍 完整错误堆栈:")
        traceback.print_exc()
        print("="*60)
        logger.error(f"生成题目API异常: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'服务器内部错误: {str(e)}'
        }), 500

@api_bp.route('/save-questions', methods=['POST'])
def save_questions():
    """保存题目API"""
    print("\n" + "="*50)
    print("💾 API DEBUG - 保存题目接口")
    print("="*50)
    
    try:
        data = request.get_json()
        print(f"📋 接收到的数据: {data}")
        
        if not data or not data.get('questions'):
            print("❌ 没有要保存的题目")
            return jsonify({
                'success': False,
                'message': '没有要保存的题目'
            }), 400
        
        questions = data.get('questions', [])
        created_by = data.get('created_by', 1)  # 默认教师ID为1
        print(f"📝 题目数量: {len(questions)}")
        print(f"👤 创建者ID: {created_by}")
        
        # 保存题目到数据库
        result = Question.save_questions(questions, created_by)
        
        if result['success']:
            print(f"✅ 题目保存成功")
            return jsonify(result)
        else:
            print(f"❌ 题目保存失败: {result['message']}")
            return jsonify(result), 500
        
    except Exception as e:
        print(f"❌ 保存题目API异常: {str(e)}")
        logger.error(f"保存题目API异常: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'保存失败: {str(e)}'
        }), 500

@api_bp.route('/export-questions', methods=['POST'])
def export_questions():
    """导出题目API（暂时只返回成功消息，后续可实现文件导出）"""
    try:
        data = request.get_json()
        
        if not data or not data.get('questions'):
            return jsonify({
                'success': False,
                'message': '没有要导出的题目'
            }), 400
        
        questions = data.get('questions', [])
        export_format = data.get('format', 'json')  # json, excel, word
        
        logger.info(f"导出{len(questions)}道题目，格式: {export_format}")
        
        # TODO: 这里可以添加文件导出逻辑
        
        return jsonify({
            'success': True,
            'message': f'题目导出功能开发中，将导出{len(questions)}道题目为{export_format}格式',
            'download_url': None  # 后续可返回下载链接
        })
        
    except Exception as e:
        logger.error(f"导出题目API异常: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'导出失败: {str(e)}'
        }), 500

@api_bp.route('/test', methods=['GET'])
def test_api():
    """API测试接口"""
    return jsonify({
        'success': True,
        'message': 'API服务正常',
        'timestamp': str(__import__('datetime').datetime.now())
    })

# ==================== 试卷相关API ====================

@api_bp.route('/papers', methods=['POST'])
def create_paper():
    """创建试卷API"""
    print("\n" + "="*50)
    print("📝 API DEBUG - 创建试卷接口")
    print("="*50)
    
    try:
        data = request.get_json()
        print(f"📋 接收到的数据: {data}")
        
        if not data:
            return jsonify({'success': False, 'message': '请求数据不能为空'}), 400
        
        # 验证必填字段
        required_fields = ['title', 'subject', 'grade']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'缺少必填字段: {field}'
                }), 400
        
        # 创建试卷
        result = Paper.create_paper(
            title=data['title'],
            description=data.get('description', ''),
            subject=data['subject'],
            grade=data['grade'],
            created_by=data.get('created_by', 1),  # 默认教师ID为1
            time_limit=data.get('time_limit', 60)
        )
        
        if result['success']:
            print(f"✅ 试卷创建成功")
            return jsonify(result)
        else:
            print(f"❌ 试卷创建失败: {result['message']}")
            return jsonify(result), 500
            
    except Exception as e:
        print(f"❌ 创建试卷API异常: {str(e)}")
        logger.error(f"创建试卷API异常: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'创建失败: {str(e)}'
        }), 500

@api_bp.route('/papers/<int:paper_id>', methods=['GET'])
def get_paper(paper_id):
    """获取试卷详情API"""
    try:
        paper = Paper.get_paper_by_id(paper_id)
        if not paper:
            return jsonify({'success': False, 'message': '试卷不存在'}), 404
        
        # 获取试卷中的题目
        questions = Paper.get_paper_questions(paper_id)
        paper['questions'] = questions
        paper['question_count'] = len(questions)
        
        return jsonify({
            'success': True,
            'paper': paper
        })
        
    except Exception as e:
        logger.error(f"获取试卷API异常: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'获取失败: {str(e)}'
        }), 500

@api_bp.route('/papers', methods=['GET'])
def get_papers():
    """获取试卷列表API"""
    try:
        teacher_id = request.args.get('teacher_id', 1, type=int)
        papers = Paper.get_papers_by_teacher(teacher_id)
        
        return jsonify({
            'success': True,
            'papers': papers
        })
        
    except Exception as e:
        logger.error(f"获取试卷列表API异常: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'获取失败: {str(e)}'
        }), 500

@api_bp.route('/papers/<int:paper_id>/questions', methods=['POST'])
def add_question_to_paper(paper_id):
    """向试卷添加题目API"""
    print(f"\n📝 向试卷{paper_id}添加题目")
    
    try:
        data = request.get_json()
        print(f"📋 接收到的数据: {data}")
        
        if not data or not data.get('question_id'):
            return jsonify({'success': False, 'message': '缺少题目ID'}), 400
        
        result = Paper.add_question_to_paper(
            paper_id=paper_id,
            question_id=data['question_id'],
            score=data.get('score', 10)
        )
        
        if result['success']:
            print(f"✅ 题目添加成功")
            return jsonify(result)
        else:
            print(f"❌ 题目添加失败: {result['message']}")
            return jsonify(result), 500
            
    except Exception as e:
        print(f"❌ 添加题目API异常: {str(e)}")
        logger.error(f"添加题目到试卷API异常: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'添加失败: {str(e)}'
        }), 500

@api_bp.route('/papers/<int:paper_id>/publish', methods=['POST'])
def publish_paper(paper_id):
    """发布试卷API"""
    print(f"\n📢 发布试卷{paper_id}")
    
    try:
        result = Paper.publish_paper(paper_id)
        
        if result['success']:
            print(f"✅ 试卷发布成功")
            return jsonify(result)
        else:
            print(f"❌ 试卷发布失败: {result['message']}")
            return jsonify(result), 400
            
    except Exception as e:
        print(f"❌ 发布试卷API异常: {str(e)}")
        logger.error(f"发布试卷API异常: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'发布失败: {str(e)}'
        }), 500

@api_bp.route('/papers/<int:paper_id>', methods=['DELETE'])
def delete_paper(paper_id):
    """删除试卷API"""
    try:
        result = Paper.delete_paper(paper_id)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"删除试卷API异常: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'删除失败: {str(e)}'
        }), 500

@api_bp.route('/papers/<int:paper_id>/questions/<int:question_id>', methods=['DELETE'])
def remove_question_from_paper(paper_id, question_id):
    """从试卷中移除题目API"""
    try:
        result = Paper.remove_question_from_paper(paper_id, question_id)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"移除题目API异常: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'移除失败: {str(e)}'
        }), 500

# ==================== 智能分析API ====================

@api_bp.route('/papers/<int:paper_id>/analysis', methods=['GET'])
def get_paper_analysis(paper_id):
    """获取试卷智能分析API"""
    print(f"\n📊 获取试卷{paper_id}的智能分析")
    
    try:
        # 检查试卷是否存在
        paper = Paper.get_paper_by_id(paper_id)
        if not paper:
            return jsonify({'success': False, 'message': '试卷不存在'}), 404
        
        # 生成模拟分析数据（实际项目中这里会调用AI分析服务）
        analysis_data = generate_mock_analysis_data(paper_id)
        
        print(f"✅ 分析数据生成成功")
        
        return jsonify({
            'success': True,
            'analysis': analysis_data
        })
        
    except Exception as e:
        print(f"❌ 获取分析失败: {str(e)}")
        logger.error(f"获取试卷分析API异常: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'获取分析失败: {str(e)}'
        }), 500

def generate_mock_analysis_data(paper_id):
    """生成模拟分析数据"""
    import random
    
    return {
        'paper_id': paper_id,
        'statistics': {
            'total_students': random.randint(20, 80),
            'completed_students': random.randint(15, 70),
            'average_score': round(random.uniform(65, 95), 1),
            'highest_score': random.randint(85, 100),
            'lowest_score': random.randint(30, 65),
            'pass_rate': round(random.uniform(70, 95), 1),
            'excellent_rate': round(random.uniform(15, 45), 1)
        },
        'question_analysis': [
            {
                'question_id': i + 1,
                'question_type': random.choice(['choice', 'fill', 'essay']),
                'correct_rate': round(random.uniform(40, 95), 1),
                'difficulty_level': random.choice(['easy', 'medium', 'hard']),
                'common_errors': [
                    f"常见错误{j + 1}" for j in range(random.randint(1, 3))
                ]
            } for i in range(random.randint(5, 15))
        ],
        'insights': [
            "本次考试整体表现良好，平均分高于预期",
            "第3题和第7题正确率较低，建议重点讲解相关知识点",
            "选择题部分学生掌握较好，简答题有待提高",
            "建议加强基础概念的理解和应用能力培养"
        ],
        'recommendations': [
            "针对低正确率题目，建议安排专项练习",
            "可以设计更多类似题目帮助学生巩固薄弱知识点",
            "建议在下次课堂上重点讲解错误率高的题目",
            "可以组织小组讨论，让学生互相学习解题思路"
        ],
        'generated_at': __import__('datetime').datetime.now().isoformat()
    }

@api_bp.route('/statistics/overview', methods=['GET'])
def get_statistics_overview():
    """获取教师统计概览API"""
    try:
        teacher_id = request.args.get('teacher_id', 1, type=int)
        
        # 获取试卷统计
        papers = Paper.get_papers_by_teacher(teacher_id)
        
        total_papers = len(papers)
        draft_papers = len([p for p in papers if p['status'] == 'draft'])
        published_papers = len([p for p in papers if p['status'] == 'published'])
        closed_papers = len([p for p in papers if p['status'] == 'closed'])
        
        # 模拟其他统计数据
        import random
        total_questions = sum(p.get('question_count', 0) for p in papers)
        total_students = random.randint(50, 200)
        total_exams = random.randint(20, 100)
        
        statistics = {
            'papers': {
                'total': total_papers,
                'draft': draft_papers,
                'published': published_papers,
                'closed': closed_papers
            },
            'questions': {
                'total': total_questions,
                'by_type': {
                    'choice': random.randint(10, 50),
                    'fill': random.randint(5, 30),
                    'essay': random.randint(3, 20),
                    'calculation': random.randint(2, 15)
                }
            },
            'students': {
                'total': total_students,
                'active': random.randint(30, total_students)
            },
            'exams': {
                'total': total_exams,
                'completed': random.randint(15, total_exams),
                'in_progress': random.randint(0, 10)
            }
        }
        
        return jsonify({
            'success': True,
            'statistics': statistics
        })
        
    except Exception as e:
        logger.error(f"获取统计概览API异常: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'获取统计失败: {str(e)}'
        }), 500
