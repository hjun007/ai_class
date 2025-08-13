// 教师模块JavaScript功能

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('教师智能出题模块已加载');
    
    // 初始化难度滑块显示
    initDifficultySlider();
    
    // 初始化文件上传
    initFileUpload();
});

// 选项卡切换功能
function switchTab(tabId) {
    console.log('切换到选项卡:', tabId);
    
    // 移除所有活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 激活当前选项卡
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// 初始化难度滑块
function initDifficultySlider() {
    const slider = document.getElementById('difficulty');
    if (!slider) return;
    
    const updateSliderDisplay = () => {
        const value = slider.value;
        const labels = ['', '简单', '较简单', '普通', '较困难', '困难'];
        console.log('难度设置为:', labels[value]);
    };
    
    slider.addEventListener('input', updateSliderDisplay);
    updateSliderDisplay(); // 初始化显示
}

// AI生成题目功能
function generateQuestions() {
    console.log('\n' + '='.repeat(50));
    console.log('🎯 FRONTEND DEBUG - 开始生成AI题目');
    console.log('='.repeat(50));
    
    // 获取配置参数
    console.log('📋 步骤1: 获取配置参数');
    const config = getGenerateConfig();
    console.log('✅ 配置参数获取完成:', config);
    
    // 验证必填参数
    console.log('\n🔍 步骤2: 验证必填参数');
    if (!validateConfig(config)) {
        console.log('❌ 参数验证失败，停止执行');
        console.log('='.repeat(50));
        return;
    }
    console.log('✅ 参数验证通过');
    
    // 显示加载状态
    console.log('\n⏳ 步骤3: 显示加载状态');
    showGenerateLoading();
    console.log('✅ 加载状态已显示');
    
    // 调用后端API生成题目
    console.log('\n🌐 步骤4: 调用后端API');
    console.log('📡 请求URL: /api/generate-questions');
    console.log('📋 请求数据:', JSON.stringify(config, null, 2));
    
    const startTime = Date.now();
    
    fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
    })
    .then(response => {
        const responseTime = Date.now() - startTime;
        console.log(`\n📥 步骤5: 收到API响应 (耗时: ${responseTime}ms)`);
        console.log('📊 响应状态:', response.status, response.statusText);
        console.log('🔗 响应头:', [...response.headers.entries()]);
        console.log('✅ 开始解析JSON...');
        return response.json();
    })
    .then(data => {
        console.log('\n📖 步骤6: 解析API响应数据');
        console.log('📋 完整响应数据:', data);
        console.log('✅ 成功状态:', data.success);
        console.log('📝 消息:', data.message);
        console.log('📊 题目数量:', data.questions ? data.questions.length : 0);
        
        if (data.success) {
            console.log('\n🎉 步骤7: 处理成功响应');
            if (data.questions && data.questions.length > 0) {
                console.log('📋 题目预览:');
                data.questions.forEach((q, i) => {
                    console.log(`  题目${i+1}: ${q.title || 'N/A'}`);
                    console.log(`    类型: ${q.type || 'N/A'}`);
                    console.log(`    内容: ${(q.content || 'N/A').substring(0, 50)}...`);
                });
                displayGeneratedQuestions(data.questions);
                showToast(data.message, 'success');
                console.log('✅ 题目显示完成');
            } else {
                console.log('⚠️ 警告: 响应成功但没有题目数据');
                showToast('生成成功但没有返回题目', 'warning');
            }
        } else {
            console.log('\n❌ 步骤7: 处理失败响应');
            console.log('🐛 失败原因:', data.message);
            showToast(data.message || '生成题目失败', 'error');
            // 显示错误状态
            showGenerateError(data.message);
        }
    })
    .catch(error => {
        console.log('\n❌ API调用异常!');
        console.log('🐛 错误类型:', error.name);
        console.log('📝 错误信息:', error.message);
        console.log('🔍 完整错误:', error);
        console.log('📍 错误堆栈:', error.stack);
        
        showToast('网络错误，请检查连接', 'error');
        showGenerateError('网络连接失败: ' + error.message);
    })
    .finally(() => {
        console.log('\n🏁 步骤8: 清理和完成');
        hideGenerateLoading();
        console.log('✅ 加载状态已隐藏');
        console.log('='.repeat(50));
    });
}

// 获取生成配置
function getGenerateConfig() {
    const config = {
        subject: document.getElementById('subject').value,
        grade: document.getElementById('grade').value,
        question_type: document.getElementById('questionType').value,  // 后端期望下划线命名
        difficulty: parseInt(document.getElementById('difficulty').value),
        question_count: parseInt(document.getElementById('questionCount').value),
        knowledge_points: document.getElementById('knowledgePoints').value,
        custom_requirements: document.getElementById('customRequirements').value
    };
    
    console.log('📋 配置参数详情:');
    console.log('  subject:', config.subject);
    console.log('  grade:', config.grade);
    console.log('  question_type:', config.question_type);
    console.log('  difficulty:', config.difficulty);
    console.log('  question_count:', config.question_count);
    console.log('  knowledge_points:', config.knowledge_points);
    console.log('  custom_requirements:', config.custom_requirements);
    
    return config;
}

// 验证配置参数
function validateConfig(config) {
    console.log('🔍 验证配置参数详情:');
    console.log('  科目 (subject):', config.subject, config.subject ? '✅' : '❌');
    console.log('  年级 (grade):', config.grade, config.grade ? '✅' : '❌');
    console.log('  题目类型 (question_type):', config.question_type, config.question_type ? '✅' : '❌');
    console.log('  题目数量 (question_count):', config.question_count);
    console.log('  知识点 (knowledge_points):', config.knowledge_points || '(未填写)');
    console.log('  自定义要求 (custom_requirements):', config.custom_requirements || '(未填写)');
    
    if (!config.subject) {
        console.log('❌ 验证失败: 未选择科目');
        showToast('请选择科目', 'error');
        return false;
    }
    
    if (!config.grade) {
        console.log('❌ 验证失败: 未选择年级');
        showToast('请选择年级', 'error');
        return false;
    }
    
    if (!config.question_type) {
        console.log('❌ 验证失败: 未选择题目类型');
        showToast('请选择题目类型', 'error');
        return false;
    }
    
    const count = parseInt(config.question_count);
    console.log('  题目数量验证:', count, '范围检查:', count >= 1 && count <= 20);
    if (count < 1 || count > 20) {
        console.log('❌ 验证失败: 题目数量超出范围');
        showToast('生成数量应在1-20之间', 'error');
        return false;
    }
    
    console.log('✅ 所有参数验证通过');
    return true;
}

// 显示生成加载状态
function showGenerateLoading() {
    const generateBtn = document.querySelector('.generate-actions .btn-primary');
    const previewArea = document.getElementById('previewArea');
    
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    
    previewArea.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <h4>AI正在生成题目...</h4>
            <p>请稍等，这可能需要几秒钟时间</p>
        </div>
    `;
    
    // 添加加载动画样式
    if (!document.querySelector('#loadingStyles')) {
        const style = document.createElement('style');
        style.id = 'loadingStyles';
        style.textContent = `
            .loading-state {
                text-align: center;
                color: #666;
            }
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #e1e5e9;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem auto;
            }
        `;
        document.head.appendChild(style);
    }
}

// 隐藏生成加载状态
function hideGenerateLoading() {
    const generateBtn = document.querySelector('.generate-actions .btn-primary');
    
    generateBtn.classList.remove('loading');
    generateBtn.disabled = false;
}

// 生成模拟题目数据
function generateMockQuestions(config) {
    const subjects = {
        'math': '数学',
        'chinese': '语文',
        'english': '英语',
        'physics': '物理',
        'chemistry': '化学'
    };
    
    const questionTypes = {
        'choice': '选择题',
        'fill': '填空题',
        'essay': '简答题',
        'calculation': '计算题'
    };
    
    const mockQuestions = [];
    const count = parseInt(config.questionCount);
    
    for (let i = 1; i <= count; i++) {
        let question = {
            id: `q_${Date.now()}_${i}`,
            type: config.questionType,
            subject: config.subject,
            difficulty: parseInt(config.difficulty),
            title: `${subjects[config.subject]}${questionTypes[config.questionType]} ${i}`,
            content: '',
            options: [],
            answer: '',
            explanation: ''
        };
        
        // 根据题目类型生成不同的内容
        switch (config.questionType) {
            case 'choice':
                question.content = `这是一道${subjects[config.subject]}选择题，难度等级${config.difficulty}。请选择正确答案。`;
                question.options = ['选项A', '选项B', '选项C', '选项D'];
                question.answer = 'A';
                break;
            case 'fill':
                question.content = `这是一道${subjects[config.subject]}填空题，请在横线上填入正确答案：______。`;
                question.answer = '正确答案';
                break;
            case 'essay':
                question.content = `这是一道${subjects[config.subject]}简答题，请详细回答以下问题。`;
                question.answer = '参考答案要点...';
                break;
            case 'calculation':
                question.content = `这是一道${subjects[config.subject]}计算题，请写出详细的解题步骤。`;
                question.answer = '解题步骤...';
                break;
        }
        
        question.explanation = `这道题考查的是${config.knowledgePoints || '相关知识点'}，解题思路是...`;
        
        mockQuestions.push(question);
    }
    
    return mockQuestions;
}

// 显示生成的题目
function displayGeneratedQuestions(questions) {
    console.log('🎯 显示生成的题目，数量:', questions.length);
    console.log('📋 题目数据预览:', questions);
    
    const previewArea = document.getElementById('previewArea');
    const previewActions = document.getElementById('previewActions');
    
    let html = '<div class="generated-questions">';
    
    const cfg = getGenerateConfig();
    questions.forEach((question, index) => {
        // 确保题目对象有必需的字段
        const safeQuestion = {
            id: question.id || `q_${Date.now()}_${index}`,
            type: question.type || cfg.question_type || 'choice',
            title: question.title || `题目 ${index + 1}`,
            content: question.content || '题目内容',
            options: question.options || [],
            correct_answer: question.correct_answer || question.reference_answer || question.final_answer || question.answer || '暂无答案',
            explanation: question.explanation || question.solution_steps || '暂无解析',
            subject: question.subject || cfg.subject || '',
            grade: question.grade || cfg.grade || '',
            difficulty: question.difficulty || cfg.difficulty || 3
        };
        
        console.log(`📝 题目${index + 1}安全处理后:`, safeQuestion);
        html += `
            <div class="question-card"
                 data-question-id="${safeQuestion.id}"
                 data-type="${safeQuestion.type}"
                 data-subject="${safeQuestion.subject}"
                 data-grade="${safeQuestion.grade}"
                 data-difficulty="${safeQuestion.difficulty}">
                <div class="question-header">
                    <span class="question-number">题目 ${index + 1}</span>
                    <span class="question-type">${getQuestionTypeText(safeQuestion.type)}</span>
                    <span class="question-difficulty">难度: ${getDifficultyText(safeQuestion.difficulty)}</span>
                </div>
                <div class="question-content">
                    <h4>${safeQuestion.title}</h4>
                    <p>${safeQuestion.content}</p>
                    ${safeQuestion.options && safeQuestion.options.length > 0 ? generateOptionsHtml(safeQuestion.options) : ''}
                </div>
                <div class="question-answer">
                    <strong>参考答案:</strong> ${safeQuestion.correct_answer}
                </div>
                <div class="question-explanation">
                    <strong>解析:</strong> ${safeQuestion.explanation}
                </div>
                <div class="question-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editQuestion('${safeQuestion.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteQuestion('${safeQuestion.id}')">删除</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    previewArea.innerHTML = html;
    previewActions.style.display = 'flex';
    
    // 添加题目卡片样式
    addQuestionCardStyles();
}

// 添加题目卡片样式
function addQuestionCardStyles() {
    if (document.querySelector('#questionCardStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'questionCardStyles';
    style.textContent = `
        .generated-questions {
            max-height: 500px;
            overflow-y: auto;
            padding-right: 10px;
        }
        
        .question-card {
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            background: white;
        }
        
        .question-header {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }
        
        .question-number {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .question-type, .question-difficulty {
            background: #f8f9fa;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.8rem;
            color: #666;
        }
        
        .question-content h4 {
            margin: 0 0 0.5rem 0;
            color: #333;
        }
        
        .question-content p {
            margin: 0 0 1rem 0;
            line-height: 1.6;
        }
        
        .question-options {
            margin: 1rem 0;
        }
        
        .option-item {
            padding: 0.5rem 0;
            color: #555;
        }
        
        .question-answer, .question-explanation {
            margin: 1rem 0;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 0.9rem;
        }
        
        .question-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .generated-questions::-webkit-scrollbar {
            width: 6px;
        }
        
        .generated-questions::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }
        
        .generated-questions::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }
        
        .generated-questions::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
    `;
    document.head.appendChild(style);
}

// 生成选项HTML
function generateOptionsHtml(options) {
    let html = '<div class="question-options">';
    options.forEach((option, index) => {
        const letter = String.fromCharCode(65 + index); // A, B, C, D
        html += `<div class="option-item">${letter}. ${option}</div>`;
    });
    html += '</div>';
    return html;
}

// 获取题目类型文本
function getQuestionTypeText(type) {
    const types = {
        'choice': '选择题',
        'fill': '填空题',
        'essay': '简答题',
        'calculation': '计算题'
    };
    return types[type] || type;
}

// 获取难度等级文本
function getDifficultyText(difficulty) {
    const levels = ['', '简单', '较简单', '普通', '较困难', '困难'];
    return levels[difficulty] || '普通';
}

// 保存题目
function saveQuestions() {
    console.log('保存生成的题目');
    
    const questions = getCurrentQuestions();
    if (!questions || questions.length === 0) {
        showToast('没有可保存的题目', 'error');
        return;
    }
    
    fetch('/api/save-questions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions: questions })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'success');
        } else {
            showToast(data.message || '保存失败', 'error');
        }
    })
    .catch(error => {
        console.error('保存失败:', error);
        showToast('保存失败，请重试', 'error');
    });
}

// 重新生成题目
function regenerateQuestions() {
    console.log('重新生成题目');
    if (confirm('确定要重新生成题目吗？当前题目将被替换。')) {
        generateQuestions();
    }
}

// 导出题目
function exportQuestions() {
    console.log('导出题目');
    
    const questions = getCurrentQuestions();
    if (!questions || questions.length === 0) {
        showToast('没有可导出的题目', 'error');
        return;
    }
    
    fetch('/api/export-questions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            questions: questions,
            format: 'json'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'info');
            // 如果有下载链接，可以触发下载
            if (data.download_url) {
                window.open(data.download_url, '_blank');
            }
        } else {
            showToast(data.message || '导出失败', 'error');
        }
    })
    .catch(error => {
        console.error('导出失败:', error);
        showToast('导出失败，请重试', 'error');
    });
}

// 编辑题目
function editQuestion(questionId) {
    console.log('编辑题目:', questionId);
    showToast('题目编辑功能开发中...', 'info');
}

// 删除题目
function deleteQuestion(questionId) {
    if (confirm('确定要删除这道题目吗？')) {
        console.log('删除题目:', questionId);
        const questionCard = document.querySelector(`[data-question-id="${questionId}"]`);
        if (questionCard) {
            questionCard.remove();
            showToast('题目已删除', 'success');
        }
    }
}

// 初始化文件上传
function initFileUpload() {
    const fileUpload = document.getElementById('fileUpload');
    if (!fileUpload) return;
    
    fileUpload.addEventListener('change', handleFileUpload);
}

// 触发文件上传
function triggerFileUpload() {
    document.getElementById('fileUpload').click();
}

// 处理文件上传
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('上传文件:', file.name);
    showToast('文件上传功能开发中...', 'info');
}

// 获取当前显示的题目列表
function getCurrentQuestions() {
    const questionCards = document.querySelectorAll('.question-card');
    const questions = [];
    
    questionCards.forEach(card => {
        const questionData = {
            id: card.dataset.questionId,
            type: (card.dataset.type || '').trim() || reverseTypeText(card.querySelector('.question-type')?.textContent || ''),
            title: card.querySelector('.question-content h4')?.textContent || '',
            content: card.querySelector('.question-content p')?.textContent || '',
            options: [],
            correct_answer: '',
            explanation: '',
            subject: card.dataset.subject || '',
            grade: card.dataset.grade || '',
            difficulty: parseInt(card.dataset.difficulty || '3')
        };
        
        // 获取选项（如果是选择题）
        const optionItems = card.querySelectorAll('.option-item');
        optionItems.forEach(item => {
            questionData.options.push(item.textContent);
        });
        
        // 获取答案和解析
        const answerElement = card.querySelector('.question-answer');
        if (answerElement) {
            questionData.correct_answer = answerElement.textContent.replace('参考答案:', '').trim();
        }
        
        const explanationElement = card.querySelector('.question-explanation');
        if (explanationElement) {
            questionData.explanation = explanationElement.textContent.replace('解析:', '').trim();
        }
        
        questions.push(questionData);
    });
    
    return questions;
}

// 将显示用的中文题型还原为英文键
function reverseTypeText(text) {
    const map = { '选择题': 'choice', '填空题': 'fill', '简答题': 'essay', '计算题': 'calculation' };
    return map[text] || text || '';
}

// 显示生成错误状态
function showGenerateError(message) {
    const previewArea = document.getElementById('previewArea');
    previewArea.innerHTML = `
        <div class="error-state">
            <div class="error-icon">❌</div>
            <h4>生成失败</h4>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="generateQuestions()">重新尝试</button>
        </div>
    `;
    
    // 添加错误状态样式
    if (!document.querySelector('#errorStateStyles')) {
        const style = document.createElement('style');
        style.id = 'errorStateStyles';
        style.textContent = `
            .error-state {
                text-align: center;
                color: #dc3545;
                padding: 2rem;
            }
            .error-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            .error-state h4 {
                margin: 0 0 0.5rem 0;
                color: #dc3545;
            }
            .error-state p {
                margin: 0 0 1.5rem 0;
                color: #666;
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== 试卷管理功能 ====================

// 全局变量
let currentPaperId = null;
let savedQuestionIds = [];

// 显示创建试卷弹窗
function showPaperModal() {
    console.log('📝 显示创建试卷弹窗');
    
    const questions = getCurrentQuestions();
    if (!questions || questions.length === 0) {
        showToast('请先生成题目', 'error');
        return;
    }
    
    // 自动填充科目和年级（从生成配置中获取）
    const lastConfig = getGenerateConfig();
    if (lastConfig.subject) {
        document.getElementById('paperSubject').value = lastConfig.subject;
    }
    if (lastConfig.grade) {
        document.getElementById('paperGrade').value = lastConfig.grade;
    }
    
    document.getElementById('paperModal').style.display = 'block';
}

// 关闭创建试卷弹窗
function closePaperModal() {
    document.getElementById('paperModal').style.display = 'none';
    document.getElementById('paperForm').reset();
}

// 创建试卷
function createPaper(event) {
    event.preventDefault();
    
    console.log('🚀 开始创建试卷');
    
    const formData = {
        title: document.getElementById('paperTitle').value.trim(),
        description: document.getElementById('paperDescription').value.trim(),
        subject: document.getElementById('paperSubject').value,
        grade: document.getElementById('paperGrade').value,
        time_limit: parseInt(document.getElementById('paperTimeLimit').value),
        total_score: parseInt(document.getElementById('paperTotalScore').value),
        created_by: 1 // 默认教师ID
    };
    
    console.log('📋 试卷数据:', formData);
    
    if (!formData.title || !formData.subject || !formData.grade) {
        showToast('请填写必填字段', 'error');
        return;
    }
    
    const createBtn = document.getElementById('createPaperBtn');
    createBtn.classList.add('loading');
    createBtn.disabled = true;
    
    // 创建试卷
    fetch('/api/papers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ 试卷创建响应:', data);
        
        if (data.success) {
            currentPaperId = data.paper_id;
            showToast('试卷创建成功！', 'success');
            
            // 检查是否需要添加题目
            if (document.getElementById('addAllQuestions').checked) {
                addQuestionsToNewPaper();
            } else {
                finalizePaperCreation();
            }
        } else {
            showToast(data.message || '创建试卷失败', 'error');
            createBtn.classList.remove('loading');
            createBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('❌ 创建试卷失败:', error);
        showToast('网络错误，请重试', 'error');
        createBtn.classList.remove('loading');
        createBtn.disabled = false;
    });
}

// 向新创建的试卷添加题目
function addQuestionsToNewPaper() {
    console.log('📝 向试卷添加题目');
    
    // 首先保存题目到数据库
    const questions = getCurrentQuestions();
    
    fetch('/api/save-questions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            questions: questions,
            created_by: 1
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.question_ids) {
            savedQuestionIds = data.question_ids;
            console.log('✅ 题目保存成功，IDs:', savedQuestionIds);
            
            // 逐个添加题目到试卷
            addQuestionsSequentially(0);
        } else {
            showToast('保存题目失败', 'error');
            finalizePaperCreation();
        }
    })
    .catch(error => {
        console.error('❌ 保存题目失败:', error);
        showToast('保存题目失败', 'error');
        finalizePaperCreation();
    });
}

// 按顺序添加题目到试卷
function addQuestionsSequentially(index) {
    if (index >= savedQuestionIds.length) {
        // 所有题目添加完成
        console.log('✅ 所有题目添加完成');
        
        // 检查是否需要立即发布
        if (document.getElementById('autoPublish').checked) {
            publishPaper(currentPaperId);
        } else {
            finalizePaperCreation();
        }
        return;
    }
    
    const questionId = savedQuestionIds[index];
    console.log(`📝 添加题目 ${index + 1}/${savedQuestionIds.length}, ID: ${questionId}`);
    
    fetch(`/api/papers/${currentPaperId}/questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            question_id: questionId,
            score: 10
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 继续添加下一个题目
            addQuestionsSequentially(index + 1);
        } else {
            console.error('添加题目失败:', data.message);
            // 继续添加下一个题目，即使当前失败
            addQuestionsSequentially(index + 1);
        }
    })
    .catch(error => {
        console.error('添加题目网络错误:', error);
        // 继续添加下一个题目
        addQuestionsSequentially(index + 1);
    });
}

// 发布试卷
function publishPaper(paperId) {
    console.log('📢 发布试卷:', paperId);
    
    fetch(`/api/papers/${paperId}/publish`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('试卷已发布！', 'success');
        } else {
            showToast('发布失败: ' + data.message, 'error');
        }
        finalizePaperCreation();
    })
    .catch(error => {
        console.error('发布试卷失败:', error);
        showToast('发布失败，请稍后重试', 'error');
        finalizePaperCreation();
    });
}

// 完成试卷创建流程
function finalizePaperCreation() {
    const createBtn = document.getElementById('createPaperBtn');
    createBtn.classList.remove('loading');
    createBtn.disabled = false;
    
    closePaperModal();
    
    // 询问是否查看试卷管理
    setTimeout(() => {
        if (confirm('试卷创建完成！是否查看试卷管理？')) {
            showPaperManageModal();
        }
    }, 1000);
}

// ========== 选择已有试卷并添加 ==========
let selectedPaperId = null;

function showSelectPaperModal() {
    const questions = getCurrentQuestions();
    if (!questions || questions.length === 0) {
        showToast('请先生成题目', 'error');
        return;
    }
    selectedPaperId = null;
    document.getElementById('selectedPaperInfo').textContent = '未选择试卷';
    document.getElementById('addToPaperBtn').disabled = true;
    document.getElementById('selectPaperModal').style.display = 'block';
    loadSelectablePapers();
}

function closeSelectPaperModal() {
    document.getElementById('selectPaperModal').style.display = 'none';
}

let selectablePapersCache = [];

function loadSelectablePapers() {
    const list = document.getElementById('selectablePaperList');
    list.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载可选试卷...</p>
        </div>
    `;
    fetch('/api/papers?teacher_id=1')
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            selectablePapersCache = data.papers || [];
            renderSelectablePapers(selectablePapersCache);
        } else {
            list.innerHTML = `<div class="empty-paper-list"><div class="empty-icon">❌</div><h4>加载失败</h4><p>${data.message}</p></div>`;
        }
    })
    .catch(() => {
        list.innerHTML = `<div class="empty-paper-list"><div class="empty-icon">❌</div><h4>网络错误</h4><p>无法加载可选试卷</p></div>`;
    });
}

function renderSelectablePapers(papers) {
    const list = document.getElementById('selectablePaperList');
    if (!papers.length) {
        list.innerHTML = `<div class="empty-selectable-papers"><div class="empty-icon">📄</div><h4>暂无可选试卷</h4><p>请先创建试卷</p></div>`;
        return;
    }
    let html = '';
    papers.forEach(p => {
        html += `
            <div class="selectable-paper-item" data-paper-id="${p.id}" onclick="selectPaper(${p.id}, this)">
                <div class="paper-item-header">
                    <h4 class="paper-item-title">${p.title}</h4>
                    <span class="paper-meta-tag status-${p.status}">${p.status === 'draft' ? '草稿' : (p.status === 'published' ? '已发布' : '已关闭')}</span>
                </div>
                <p class="paper-item-description">${p.description || '暂无描述'}</p>
                <div class="paper-item-meta">
                    <span class="paper-meta-tag">${getSubjectText(p.subject)}</span>
                    <span class="paper-meta-tag">${getGradeText(p.grade)}</span>
                    <span class="paper-meta-tag">${p.time_limit}分钟</span>
                </div>
                <div class="paper-stats-mini">
                    <div class="stat-mini"><span>题目:</span><span>${p.question_count || 0}</span></div>
                    <div class="stat-mini"><span>总分:</span><span>${p.total_score || 100}</span></div>
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
}

function filterSelectablePapers() {
    const text = (document.getElementById('selectPaperSearch').value || '').toLowerCase();
    const status = document.getElementById('selectPaperStatus').value;
    let arr = selectablePapersCache;
    if (text) {
        arr = arr.filter(p => (p.title || '').toLowerCase().includes(text) || (p.description || '').toLowerCase().includes(text));
    }
    if (status) {
        arr = arr.filter(p => p.status === status);
    }
    renderSelectablePapers(arr);
}

function selectPaper(paperId, el) {
    selectedPaperId = paperId;
    document.querySelectorAll('.selectable-paper-item').forEach(i => i.classList.remove('selected'));
    if (el) el.classList.add('selected');
    document.getElementById('selectedPaperInfo').textContent = `已选择试卷ID: ${paperId}`;
    document.getElementById('addToPaperBtn').disabled = false;
}

function confirmAddToPaper() {
    if (!selectedPaperId) return;
    const questions = getCurrentQuestions();
    if (!questions.length) {
        showToast('没有可添加的题目', 'error');
        return;
    }
    
    console.log('🚀 开始添加题目到试卷，试卷ID:', selectedPaperId);
    console.log('📝 待添加题目数量:', questions.length);
    
    // 显示加载状态
    const addBtn = document.getElementById('addToPaperBtn');
    const originalText = addBtn.textContent;
    addBtn.textContent = '添加中...';
    addBtn.disabled = true;
    addBtn.classList.add('loading');
    
    // 先保存题目
    fetch('/api/save-questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, created_by: 1 })
    }).then(r => r.json()).then(data => {
        if (!data.success || !data.question_ids) {
            showToast('保存题目失败', 'error');
            // 恢复按钮状态
            addBtn.textContent = originalText;
            addBtn.disabled = false;
            addBtn.classList.remove('loading');
            return;
        }
        const ids = data.question_ids;
        console.log('✅ 题目保存成功，开始添加到试卷');
        
        let successCount = 0;
        let processedCount = 0;
        
        // 逐个加入选中试卷
        const addNext = (idx) => {
            if (idx >= ids.length) {
                // 所有题目处理完成
                console.log(`🎉 题目添加完成! 成功: ${successCount}/${ids.length}`);
                
                // 恢复按钮状态
                addBtn.textContent = originalText;
                addBtn.disabled = false;
                addBtn.classList.remove('loading');
                
                if (successCount > 0) {
                    showToast(`成功添加 ${successCount}/${ids.length} 道题目到试卷！`, 'success');
                    // 延迟关闭弹窗，让用户看到成功信息
                    setTimeout(() => {
                        closeSelectPaperModal();
                        // 询问是否查看试卷管理
                        if (confirm('题目已添加到试卷！是否查看试卷管理？')) {
                            showPaperManageModal();
                        }
                    }, 1500);
                } else {
                    showToast('添加失败，请重试', 'error');
                }
                return;
            }
            
            fetch(`/api/papers/${selectedPaperId}/questions`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question_id: ids[idx], score: 10 })
            }).then(response => response.json()).then(result => {
                processedCount++;
                if (result.success) {
                    successCount++;
                    console.log(`✅ 题目 ${idx + 1}/${ids.length} 添加成功`);
                } else {
                    console.log(`❌ 题目 ${idx + 1}/${ids.length} 添加失败:`, result.message);
                }
                // 更新按钮文本显示进度
                addBtn.textContent = `添加中... (${processedCount}/${ids.length})`;
                addNext(idx + 1);
            }).catch(error => {
                processedCount++;
                console.log(`❌ 题目 ${idx + 1}/${ids.length} 网络错误:`, error);
                addBtn.textContent = `添加中... (${processedCount}/${ids.length})`;
                addNext(idx + 1);
            });
        };
        addNext(0);
    }).catch(error => {
        console.error('❌ 保存题目失败:', error);
        showToast('网络错误，保存题目失败', 'error');
        // 恢复按钮状态
        addBtn.textContent = originalText;
        addBtn.disabled = false;
        addBtn.classList.remove('loading');
    });
}

// 显示试卷管理弹窗
function showPaperManageModal() {
    console.log('📚 显示试卷管理弹窗');
    
    document.getElementById('paperManageModal').style.display = 'block';
    loadPaperList();
}

// 关闭试卷管理弹窗
function closePaperManageModal() {
    document.getElementById('paperManageModal').style.display = 'none';
}

// 加载试卷列表
function loadPaperList() {
    console.log('📋 加载试卷列表');
    
    const paperList = document.getElementById('paperList');
    paperList.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载试卷列表...</p>
        </div>
    `;
    
    fetch('/api/papers?teacher_id=1')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayPaperList(data.papers);
        } else {
            paperList.innerHTML = `
                <div class="empty-paper-list">
                    <div class="empty-icon">📄</div>
                    <h4>加载失败</h4>
                    <p>${data.message}</p>
                    <button class="btn btn-primary" onclick="loadPaperList()">重新加载</button>
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('加载试卷列表失败:', error);
        paperList.innerHTML = `
            <div class="empty-paper-list">
                <div class="empty-icon">❌</div>
                <h4>网络错误</h4>
                <p>无法加载试卷列表</p>
                <button class="btn btn-primary" onclick="loadPaperList()">重新加载</button>
            </div>
        `;
    });
}

// 显示试卷列表
function displayPaperList(papers) {
    const paperList = document.getElementById('paperList');
    
    if (!papers || papers.length === 0) {
        paperList.innerHTML = `
            <div class="empty-paper-list">
                <div class="empty-icon">📄</div>
                <h4>还没有试卷</h4>
                <p>开始创建您的第一张试卷吧</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    papers.forEach(paper => {
        const statusText = {
            'draft': '草稿',
            'published': '已发布',
            'closed': '已关闭'
        }[paper.status] || paper.status;
        
        const statusClass = `status-${paper.status}`;
        
        html += `
            <div class="paper-card">
                <div class="paper-header">
                    <div class="paper-info">
                        <h4>${paper.title}</h4>
                        <p>${paper.description || '暂无描述'}</p>
                    </div>
                </div>
                
                <div class="paper-meta">
                    <span class="paper-tag">${getSubjectText(paper.subject)}</span>
                    <span class="paper-tag">${getGradeText(paper.grade)}</span>
                    <span class="paper-tag ${statusClass}">${statusText}</span>
                    <span class="paper-tag">${paper.time_limit}分钟</span>
                </div>
                
                <div class="paper-stats">
                    <div class="stat-item">
                        <span class="stat-value">${paper.question_count || 0}</span>
                        <span class="stat-label">题目数</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${paper.total_score || 100}</span>
                        <span class="stat-label">总分</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${formatDate(paper.created_at)}</span>
                        <span class="stat-label">创建时间</span>
                    </div>
                </div>
                
                <div class="paper-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewPaper(${paper.id})">查看详情</button>
                    ${paper.status === 'draft' ? `
                        <button class="btn btn-sm btn-success" onclick="publishPaper(${paper.id})">发布试卷</button>
                        <button class="btn btn-sm btn-secondary" onclick="editPaper(${paper.id})">编辑</button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger" onclick="deletePaper(${paper.id}, '${paper.title}')">删除</button>
                </div>
            </div>
        `;
    });
    
    paperList.innerHTML = html;
}

// 辅助函数
function getSubjectText(subject) {
    const subjects = {
        'math': '数学',
        'chinese': '语文',
        'english': '英语',
        'physics': '物理',
        'chemistry': '化学',
        'biology': '生物',
        'history': '历史',
        'geography': '地理',
        'information': '信息技术'
    };
    return subjects[subject] || subject;
}

function getGradeText(grade) {
    const grades = {
        'grade1': '一年级',
        'grade2': '二年级',
        'grade3': '三年级',
        'grade4': '四年级',
        'grade5': '五年级',
        'grade6': '六年级',
        'grade7': '七年级',
        'grade8': '八年级',
        'grade9': '九年级'
    };
    return grades[grade] || grade;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 试卷操作函数
function viewPaper(paperId) {
    console.log('👁️ 查看试卷:', paperId);
    showToast('试卷详情功能开发中...', 'info');
}

function editPaper(paperId) {
    console.log('✏️ 编辑试卷:', paperId);
    showToast('试卷编辑功能开发中...', 'info');
}

function deletePaper(paperId, title) {
    if (confirm(`确定要删除试卷"${title}"吗？此操作不可恢复。`)) {
        console.log('🗑️ 删除试卷:', paperId);
        
        fetch(`/api/papers/${paperId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('试卷删除成功', 'success');
                loadPaperList(); // 重新加载列表
            } else {
                showToast('删除失败: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('删除试卷失败:', error);
            showToast('删除失败，请重试', 'error');
        });
    }
}

// 消息提示函数（如果main.js中没有的话）
function showToast(message, type = 'info') {
    // 如果main.js中已经有showToast函数，这里就不需要重复定义
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // 简单的alert作为后备方案
    alert(message);
}
