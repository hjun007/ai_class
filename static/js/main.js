// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI智能课程助手系统已加载');
    console.log('当前页面路径:', window.location.pathname);
    console.log('当前localStorage状态:', {
        userRole: localStorage.getItem('userRole'),
        username: localStorage.getItem('username'),
        loginTime: localStorage.getItem('loginTime')
    });
    
    // 初始化页面动画
    initPageAnimations();
    
    // 初始化菜单项交互
    initMenuInteractions();
    
    // 检查登录状态
    checkLoginStatus();
});

// 初始化页面动画
function initPageAnimations() {
    // 为菜单项添加进入动画
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// 初始化菜单交互
function initMenuInteractions() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// 全局变量
let currentLoginRole = '';

// 显示登录弹窗
function showLoginModal(role) {
    console.log('显示登录弹窗，角色:', role);
    currentLoginRole = role;
    console.log('设置currentLoginRole为:', currentLoginRole);
    
    const modal = document.getElementById('loginModal');
    const modalTitle = document.getElementById('modalTitle');
    const roleIcon = document.getElementById('roleIcon');
    const loginTip = document.getElementById('loginTip');
    
    // 设置不同角色的标题和图标
    if (role === 'student') {
        modalTitle.textContent = '学生登录';
        roleIcon.textContent = '👨‍🎓';
        loginTip.textContent = '测试账号：student / 123456';
    } else if (role === 'teacher') {
        modalTitle.textContent = '教师登录';
        roleIcon.textContent = '👨‍🏫';
        loginTip.textContent = '测试账号：teacher / 123456';
    }
    
    // 显示弹窗
    modal.style.display = 'block';
    
    // 清空表单
    document.getElementById('loginForm').reset();
    
    // 聚焦到用户名输入框
    setTimeout(() => {
        document.getElementById('username').focus();
    }, 300);
}

// 关闭登录弹窗
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    currentLoginRole = '';
}

// 处理登录
function handleLogin(event) {
    event.preventDefault();
    
    console.log('开始处理登录，当前角色:', currentLoginRole);
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginButton = document.getElementById('loginButton');
    
    // 验证输入
    if (!username || !password) {
        showToast('请输入完整的账号和密码！', 'error');
        return;
    }
    
    // 显示加载状态
    loginButton.classList.add('loading');
    loginButton.disabled = true;
    
    // 模拟登录验证（实际项目中应该发送到后端验证）
    setTimeout(() => {
        let loginSuccess = false;
        
        if (currentLoginRole === 'student') {
            loginSuccess = (username === 'student' && password === '123456');
        } else if (currentLoginRole === 'teacher') {
            loginSuccess = (username === 'teacher' && password === '123456');
        }
        
        // 移除加载状态
        loginButton.classList.remove('loading');
        loginButton.disabled = false;
        
        if (loginSuccess) {
            console.log('登录成功，当前角色:', currentLoginRole);
            showToast('登录成功！正在跳转...', 'success');
            
            // 保存登录状态到本地存储
            localStorage.setItem('userRole', currentLoginRole);
            localStorage.setItem('username', username);
            localStorage.setItem('loginTime', new Date().toISOString());
            
            console.log('已保存到localStorage:', {
                userRole: localStorage.getItem('userRole'),
                username: localStorage.getItem('username')
            });
            
            // 在关闭弹窗前保存角色信息，避免被清空
            const roleForJump = currentLoginRole;
            console.log('保存跳转用角色:', roleForJump);
            
            // 关闭弹窗
            closeLoginModal();
            
            // 确保localStorage已保存，然后跳转
            setTimeout(() => {
                const targetUrl = roleForJump === 'student' ? '/student' : '/teacher';
                console.log('准备跳转到:', targetUrl, '(使用保存的角色:', roleForJump, ')');
                console.log('跳转前再次确认localStorage:', {
                    userRole: localStorage.getItem('userRole'),
                    username: localStorage.getItem('username')
                });
                
                // 使用location.assign确保跳转
                window.location.assign(targetUrl);
            }, 100); // 很短的延迟，确保localStorage保存完成
        } else {
            showToast('账号或密码错误，请重试！', 'error');
            // 清空密码输入框
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    }, 1000); // 模拟网络延迟
}

// 显示消息提示
function showToast(message, type = 'info') {
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast ${type}`;
    messageDiv.textContent = message;
    
    // 添加样式
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '3000',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word'
    };
    
    // 根据类型设置背景色
    if (type === 'success') {
        styles.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    } else if (type === 'error') {
        styles.background = 'linear-gradient(135deg, #f44336, #da190b)';
    } else {
        styles.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    }
    
    // 应用样式
    Object.assign(messageDiv.style, styles);
    
    // 添加动画样式
    if (!document.querySelector('#messageAnimationStyles')) {
        const animationStyles = document.createElement('style');
        animationStyles.id = 'messageAnimationStyles';
        animationStyles.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(animationStyles);
    }
    
    // 添加到页面
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// 点击弹窗外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLoginModal();
    }
}

// 键盘事件处理
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('loginModal');
    if (modal && modal.style.display === 'block') {
        if (event.key === 'Escape') {
            closeLoginModal();
        }
    }
});

// 角色切换函数（保留兼容性，用于学生和教师页面）
function switchRole(role) {
    const baseUrl = window.location.origin;
    
    switch(role) {
        case 'home':
            window.location.href = baseUrl + '/';
            break;
        case 'student':
            window.location.href = baseUrl + '/student';
            break;
        case 'teacher':
            window.location.href = baseUrl + '/teacher';
            break;
        default:
            console.log('未知角色:', role);
    }
}

// 功能开启函数（学生和教师页面使用）
function openFeature(featureType) {
    const previewElement = document.getElementById('featurePreview');
    if (!previewElement) return;
    
    // 功能描述映射
    const featureDescriptions = {
        // 学生功能
        'exercise': {
            title: '在线做题',
            description: '这里将显示各种练习题目，包括选择题、填空题、计算题等。学生可以在线完成题目并获得即时反馈。',
            features: ['多种题型支持', '智能评分系统', '错题自动收集', '学习进度跟踪']
        },
        'ai-qa': {
            title: 'AI智能问答',
            description: '智能AI助手可以回答学生的各种学习问题，提供个性化的学习建议和解题思路。',
            features: ['24小时在线答疑', '个性化学习建议', '知识点解析', '学习路径推荐']
        },
        'records': {
            title: '学习记录',
            description: '查看详细的学习数据，包括做题记录、知识点掌握情况、学习时长等统计信息。',
            features: ['学习时长统计', '知识点掌握度', '做题准确率', '进步趋势分析']
        },
        'profile': {
            title: '个人中心',
            description: '管理个人信息，设置学习偏好，查看成就徽章和学习里程碑。',
            features: ['个人信息管理', '学习偏好设置', '成就徽章展示', '学习目标设定']
        },
        
        // 教师功能
        'create-question': {
            title: '智能出题',
            description: 'AI辅助教师快速创建高质量题目，支持多种题型，自动生成题目解析和评分标准。',
            features: ['AI题目生成', '多题型支持', '自动解析生成', '难度智能调节']
        },
        'analysis': {
            title: '答题结果分析',
            description: '深入分析学生答题数据，生成详细的学习报告，帮助教师了解学生学习情况。',
            features: ['成绩统计分析', '知识点掌握度', '学习趋势预测', '个性化建议']
        },
        'ai-assistant': {
            title: 'AI智能体',
            description: '教学专用AI助手，协助教师进行教学设计、课程规划和学生管理。',
            features: ['教学方案设计', '课程内容推荐', '学生管理建议', '教学效果评估']
        },
        'question-bank': {
            title: '题库管理',
            description: '管理和组织题目资源，支持题目分类、标签管理和批量操作。',
            features: ['题目分类管理', '批量导入导出', '题目质量评估', '使用频率统计']
        },
        'student-management': {
            title: '学生管理',
            description: '全面管理学生信息，跟踪学习进度，设置个性化学习计划。',
            features: ['学生档案管理', '学习进度跟踪', '个性化计划', '家长沟通工具']
        },
        'reports': {
            title: '教学报告',
            description: '自动生成各类教学报告，包括班级分析、个人报告和教学效果评估。',
            features: ['班级整体分析', '个人学习报告', '教学效果评估', '数据可视化']
        }
    };
    
    const feature = featureDescriptions[featureType];
    if (feature) {
        // 添加加载动画
        previewElement.innerHTML = '<div class="loading">正在加载功能...</div>';
        
        setTimeout(() => {
            previewElement.innerHTML = `
                <div class="preview-content">
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                    <div class="feature-list">
                        <h4>主要功能：</h4>
                        <ul>
                            ${feature.features.map(f => `<li>• ${f}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="coming-soon">
                        <p><strong>注意：</strong> 此功能正在开发中，敬请期待！</p>
                    </div>
                </div>
            `;
            
            // 添加样式
            const style = document.createElement('style');
            style.textContent = `
                .loading {
                    color: #667eea;
                    font-style: italic;
                }
                .feature-list {
                    margin: 1rem 0;
                    text-align: left;
                }
                .feature-list h4 {
                    color: #667eea;
                    margin-bottom: 0.5rem;
                }
                .feature-list ul {
                    list-style: none;
                    padding: 0;
                }
                .feature-list li {
                    padding: 0.2rem 0;
                    color: #666;
                }
                .coming-soon {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: rgba(255, 193, 7, 0.1);
                    border-radius: 8px;
                    border-left: 4px solid #ffc107;
                }
                .coming-soon p {
                    margin: 0;
                    color: #856404;
                }
            `;
            document.head.appendChild(style);
            
        }, 500);
    }
}

// 显示简单消息函数（保留兼容性）
function showSimpleMessage() {
    alert('AI智能课程助手系统运行正常！');
}

// 检查登录状态
function checkLoginStatus() {
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    const currentUserElement = document.getElementById('currentUser');
    
    console.log('检查登录状态:', {
        userRole: userRole,
        username: username,
        currentPath: window.location.pathname
    });
    
    // 如果在学生或教师页面，检查是否已登录
    const currentPath = window.location.pathname;
    if (currentPath === '/student' || currentPath === '/teacher') {
        if (!userRole || !username) {
            // 未登录，跳转到首页
            console.log('未登录，跳转到首页');
            showToast('请先登录！', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
            return;
        }
        
        // 检查角色是否匹配
        const expectedRole = currentPath.substring(1); // 去掉开头的 '/'
        console.log('角色匹配检查:', {
            userRole: userRole,
            expectedRole: expectedRole,
            currentPath: currentPath,
            match: userRole === expectedRole
        });
        
        if (userRole !== expectedRole) {
            console.log('角色不匹配！登录角色:', userRole, '期望角色:', expectedRole);
            showToast('角色不匹配，请重新登录！', 'error');
            localStorage.clear();
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
            return;
        }
        
        console.log('登录状态验证通过');
        
        // 更新用户名显示
        if (currentUserElement) {
            currentUserElement.textContent = username;
        }
    }
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除本地存储
        localStorage.clear();
        
        showToast('已退出登录', 'info');
        
        // 跳转到首页
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }
}

// 切换主题颜色函数（保留兼容性）
function changeColor() {
    const body = document.body;
    const currentBg = body.style.background;
    if (currentBg.includes('667eea') || !currentBg) {
        body.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
    } else {
        body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}
