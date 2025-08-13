// 试卷管理页面JavaScript

// 全局变量
let currentPapers = [];
let currentView = 'grid';
let currentFilter = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('\n🏫 试卷管理页面已加载');
    
    // 检查登录状态
    checkLoginStatus();
    
    // 加载试卷列表
    loadPaperList();
    
    // 加载统计数据
    loadStatistics();
});

// ==================== 试卷列表管理 ====================

// 加载试卷列表
function loadPaperList() {
    console.log('📋 加载试卷列表');
    
    const content = document.getElementById('paperListContent');
    content.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载试卷列表...</p>
        </div>
    `;
    
    fetch('/api/papers?teacher_id=1')
    .then(response => response.json())
    .then(data => {
        console.log('✅ 试卷列表加载成功:', data);
        
        if (data.success) {
            currentPapers = data.papers || [];
            displayPaperList(currentPapers);
            updateStatistics(currentPapers);
        } else {
            showErrorState('加载失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('❌ 加载试卷列表失败:', error);
        showErrorState('网络错误，请重试');
    });
}

// 显示试卷列表
function displayPaperList(papers) {
    const content = document.getElementById('paperListContent');
    
    if (!papers || papers.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📄</div>
                <div class="empty-title">还没有试卷</div>
                <div class="empty-description">点击"新建试卷"创建您的第一张试卷</div>
                <button class="btn btn-primary" onclick="showCreatePaperModal()">
                    ➕ 新建试卷
                </button>
            </div>
        `;
        return;
    }
    
    content.className = currentView === 'grid' ? 'paper-grid' : 'paper-list';
    
    let html = '';
    papers.forEach(paper => {
        html += generatePaperItemHTML(paper);
    });
    
    content.innerHTML = html;
}

// 生成试卷项HTML
function generatePaperItemHTML(paper) {
    const statusText = {
        'draft': '草稿',
        'published': '已发布',
        'closed': '已关闭'
    }[paper.status] || paper.status;
    
    const statusClass = paper.status;
    const viewClass = currentView === 'list' ? 'list-view' : '';
    
    return `
        <div class="paper-item ${viewClass}" data-paper-id="${paper.id}">
            <div class="paper-item-header">
                <div class="paper-info">
                    <h4 class="paper-title">${paper.title}</h4>
                    <p class="paper-description">${paper.description || '暂无描述'}</p>
                </div>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div class="paper-meta">
                <div class="meta-item">
                    <span class="meta-icon">📚</span>
                    <span>${getSubjectText(paper.subject)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">🎓</span>
                    <span>${getGradeText(paper.grade)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">⏰</span>
                    <span>${paper.time_limit}分钟</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">📅</span>
                    <span>${formatDate(paper.created_at)}</span>
                </div>
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
                    <span class="stat-value">${getExamCount(paper.id)}</span>
                    <span class="stat-label">考试人数</span>
                </div>
            </div>
            
            <div class="paper-actions">
                <button class="btn btn-sm btn-primary" onclick="viewPaperDetail(${paper.id})">
                    👁️ 查看详情
                </button>
                ${paper.status === 'draft' ? `
                    <button class="btn btn-sm btn-success" onclick="publishPaper(${paper.id})">
                        📢 发布试卷
                    </button>
                ` : ''}
                ${paper.status === 'published' || paper.status === 'closed' ? `
                    <button class="btn btn-sm btn-info" onclick="showAnalysis(${paper.id})">
                        📊 智能分析
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-secondary" onclick="editPaper(${paper.id})">
                    ✏️ 编辑
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePaper(${paper.id}, '${paper.title}')">
                    🗑️ 删除
                </button>
            </div>
        </div>
    `;
}

// ==================== 统计数据管理 ====================

// 加载统计数据
function loadStatistics() {
    console.log('📊 加载统计数据');
    // 这里可以调用专门的统计API，目前先用试卷列表数据计算
}

// 更新统计数据
function updateStatistics(papers) {
    const totalPapers = papers.length;
    const draftPapers = papers.filter(p => p.status === 'draft').length;
    const publishedPapers = papers.filter(p => p.status === 'published').length;
    const completedExams = papers.filter(p => p.status === 'closed').length;
    
    document.getElementById('totalPapers').textContent = totalPapers;
    document.getElementById('draftPapers').textContent = draftPapers;
    document.getElementById('publishedPapers').textContent = publishedPapers;
    document.getElementById('completedExams').textContent = completedExams;
}

// ==================== 试卷操作功能 ====================

// 显示新建试卷弹窗
function showCreatePaperModal() {
    console.log('📝 显示新建试卷弹窗');
    document.getElementById('createPaperModal').style.display = 'block';
}

// 关闭新建试卷弹窗
function closeCreatePaperModal() {
    document.getElementById('createPaperModal').style.display = 'none';
    document.getElementById('createPaperForm').reset();
}

// 创建新试卷
function createNewPaper(event) {
    event.preventDefault();
    
    console.log('🚀 创建新试卷');
    
    const formData = {
        title: document.getElementById('newPaperTitle').value.trim(),
        description: document.getElementById('newPaperDescription').value.trim(),
        subject: document.getElementById('newPaperSubject').value,
        grade: document.getElementById('newPaperGrade').value,
        time_limit: parseInt(document.getElementById('newPaperTimeLimit').value),
        total_score: parseInt(document.getElementById('newPaperTotalScore').value),
        created_by: 1
    };
    
    console.log('📋 试卷数据:', formData);
    
    if (!formData.title || !formData.subject || !formData.grade) {
        showToast('请填写必填字段', 'error');
        return;
    }
    
    const createBtn = document.getElementById('createNewPaperBtn');
    createBtn.classList.add('loading');
    createBtn.disabled = true;
    
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
            showToast('试卷创建成功！', 'success');
            closeCreatePaperModal();
            loadPaperList(); // 重新加载列表
        } else {
            showToast(data.message || '创建试卷失败', 'error');
        }
    })
    .catch(error => {
        console.error('❌ 创建试卷失败:', error);
        showToast('网络错误，请重试', 'error');
    })
    .finally(() => {
        createBtn.classList.remove('loading');
        createBtn.disabled = false;
    });
}

// 查看试卷详情
function viewPaperDetail(paperId) {
    console.log('👁️ 查看试卷详情:', paperId);
    
    const modal = document.getElementById('paperDetailModal');
    const content = document.getElementById('paperDetailContent');
    
    content.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载试卷详情...</p>
        </div>
    `;
    
    modal.style.display = 'block';
    
    fetch(`/api/papers/${paperId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayPaperDetail(data.paper);
        } else {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">❌</div>
                    <div class="empty-title">加载失败</div>
                    <div class="empty-description">${data.message}</div>
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('加载试卷详情失败:', error);
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❌</div>
                <div class="empty-title">网络错误</div>
                <div class="empty-description">无法加载试卷详情</div>
            </div>
        `;
    });
}

// 显示试卷详情
function displayPaperDetail(paper) {
    const titleElement = document.getElementById('paperDetailTitle');
    const statusElement = document.getElementById('paperDetailStatus');
    const contentElement = document.getElementById('paperDetailContent');
    
    titleElement.textContent = paper.title;
    statusElement.className = `status-badge ${paper.status}`;
    statusElement.textContent = {
        'draft': '草稿',
        'published': '已发布',
        'closed': '已关闭'
    }[paper.status] || paper.status;
    
    let html = `
        <div class="paper-detail-section">
            <div class="section-title">📋 基本信息</div>
            <div class="form-row">
                <div class="form-group">
                    <label>试卷标题</label>
                    <div class="form-value">${paper.title}</div>
                </div>
                <div class="form-group">
                    <label>试卷描述</label>
                    <div class="form-value">${paper.description || '暂无描述'}</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>科目</label>
                    <div class="form-value">${getSubjectText(paper.subject)}</div>
                </div>
                <div class="form-group">
                    <label>年级</label>
                    <div class="form-value">${getGradeText(paper.grade)}</div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>考试时长</label>
                    <div class="form-value">${paper.time_limit} 分钟</div>
                </div>
                <div class="form-group">
                    <label>试卷总分</label>
                    <div class="form-value">${paper.total_score} 分</div>
                </div>
            </div>
        </div>
    `;
    
    if (paper.questions && paper.questions.length > 0) {
        html += `
            <div class="paper-detail-section">
                <div class="section-title">📝 试卷题目 (${paper.questions.length}道)</div>
                <div class="question-list">
        `;
        
        paper.questions.forEach((question, index) => {
            html += `
                <div class="question-item">
                    <div class="question-header">
                        <span class="question-number">第${index + 1}题</span>
                        <span class="question-type">${getQuestionTypeText(question.type)}</span>
                    </div>
                    <div class="question-content">${question.content}</div>
                    ${question.options && question.options.length > 0 ? `
                        <div class="question-options">
                            ${question.options.map((option, i) => `
                                <div class="option-item">${String.fromCharCode(65 + i)}. ${option}</div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="paper-detail-section">
                <div class="section-title">📝 试卷题目</div>
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <div class="empty-title">暂无题目</div>
                    <div class="empty-description">请先添加题目到试卷中</div>
                </div>
            </div>
        `;
    }
    
    contentElement.innerHTML = html;
}

// 关闭试卷详情弹窗
function closePaperDetailModal() {
    document.getElementById('paperDetailModal').style.display = 'none';
}

// 发布试卷
function publishPaper(paperId) {
    console.log('📢 发布试卷:', paperId);
    
    if (!confirm('确定要发布这张试卷吗？发布后学生就可以参加考试了。')) {
        return;
    }
    
    fetch(`/api/papers/${paperId}/publish`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('试卷发布成功！', 'success');
            loadPaperList(); // 重新加载列表
        } else {
            showToast('发布失败: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('发布试卷失败:', error);
        showToast('发布失败，请重试', 'error');
    });
}

// 编辑试卷
function editPaper(paperId) {
    console.log('✏️ 编辑试卷:', paperId);
    showToast('试卷编辑功能开发中...', 'info');
}

// 删除试卷
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

// ==================== 智能分析功能 ====================

// 显示智能分析
function showAnalysis(paperId) {
    console.log('🧠 显示智能分析:', paperId);
    
    const modal = document.getElementById('analysisModal');
    const content = document.getElementById('analysisContent');
    const subtitle = document.getElementById('analysisSubtitle');
    
    // 获取试卷信息
    const paper = currentPapers.find(p => p.id === paperId);
    if (paper) {
        subtitle.textContent = `分析试卷：${paper.title}`;
    }
    
    content.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在生成智能分析报告...</p>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // 模拟加载分析数据
    setTimeout(() => {
        displayAnalysisContent(paperId);
    }, 2000);
}

// 显示分析内容
function displayAnalysisContent(paperId) {
    const content = document.getElementById('analysisContent');
    
    // 模拟分析数据
    const analysisData = generateMockAnalysisData(paperId);
    
    let html = `
        <div class="analysis-section">
            <div class="analysis-title">📊 考试概况</div>
            <div class="paper-stats">
                <div class="stat-item">
                    <span class="stat-value">${analysisData.totalStudents}</span>
                    <span class="stat-label">参考人数</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${analysisData.averageScore}</span>
                    <span class="stat-label">平均分</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${analysisData.passRate}%</span>
                    <span class="stat-label">及格率</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${analysisData.excellentRate}%</span>
                    <span class="stat-label">优秀率</span>
                </div>
            </div>
        </div>
        
        <div class="analysis-section">
            <div class="analysis-title">📈 成绩分布</div>
            <div class="analysis-chart">
                <p>成绩分布图表 (图表功能开发中)</p>
            </div>
        </div>
        
        <div class="analysis-section">
            <div class="analysis-title">❓ 题目分析</div>
            <div class="analysis-chart">
                <p>题目难度与正确率分析 (图表功能开发中)</p>
            </div>
        </div>
        
        <div class="analysis-section">
            <div class="analysis-title">💡 AI智能建议</div>
            <div class="analysis-insights">
    `;
    
    analysisData.insights.forEach(insight => {
        html += `<div class="insight-item">${insight}</div>`;
    });
    
    html += `
            </div>
        </div>
        
        <div class="analysis-section">
            <div class="analysis-title">🎯 改进建议</div>
            <div class="analysis-insights">
    `;
    
    analysisData.recommendations.forEach(rec => {
        html += `<div class="insight-item">${rec}</div>`;
    });
    
    html += `
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

// 生成模拟分析数据
function generateMockAnalysisData(paperId) {
    return {
        totalStudents: Math.floor(Math.random() * 50) + 20,
        averageScore: Math.floor(Math.random() * 30) + 70,
        passRate: Math.floor(Math.random() * 20) + 75,
        excellentRate: Math.floor(Math.random() * 25) + 15,
        insights: [
            "本次考试整体表现良好，平均分高于预期",
            "第3题和第7题正确率较低，建议重点讲解相关知识点",
            "选择题部分学生掌握较好，简答题有待提高",
            "建议加强基础概念的理解和应用能力培养"
        ],
        recommendations: [
            "针对低正确率题目，建议安排专项练习",
            "可以设计更多类似题目帮助学生巩固薄弱知识点",
            "建议在下次课堂上重点讲解错误率高的题目",
            "可以组织小组讨论，让学生互相学习解题思路"
        ]
    };
}

// 关闭分析弹窗
function closeAnalysisModal() {
    document.getElementById('analysisModal').style.display = 'none';
}

// ==================== 视图和筛选功能 ====================

// 切换视图
function switchView(view) {
    console.log('🔄 切换视图:', view);
    
    currentView = view;
    
    // 更新按钮状态
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // 重新显示列表
    displayPaperList(currentPapers);
}

// 筛选试卷
function filterPapers() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    console.log('🔍 筛选试卷:', { searchText, statusFilter });
    
    let filteredPapers = currentPapers;
    
    // 文本搜索
    if (searchText) {
        filteredPapers = filteredPapers.filter(paper => 
            paper.title.toLowerCase().includes(searchText) ||
            (paper.description && paper.description.toLowerCase().includes(searchText))
        );
    }
    
    // 状态筛选
    if (statusFilter) {
        filteredPapers = filteredPapers.filter(paper => paper.status === statusFilter);
    }
    
    displayPaperList(filteredPapers);
}

// 刷新试卷列表
function refreshPaperList() {
    console.log('🔄 刷新试卷列表');
    loadPaperList();
}

// ==================== 辅助函数 ====================

// 显示错误状态
function showErrorState(message) {
    const content = document.getElementById('paperListContent');
    content.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">❌</div>
            <div class="empty-title">加载失败</div>
            <div class="empty-description">${message}</div>
            <button class="btn btn-primary" onclick="loadPaperList()">重新加载</button>
        </div>
    `;
}

// 获取科目文本
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

// 获取年级文本
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

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// 获取考试人数（模拟数据）
function getExamCount(paperId) {
    return Math.floor(Math.random() * 30) + 5;
}

// 消息提示函数
function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    alert(message);
}
