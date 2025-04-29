document.addEventListener('DOMContentLoaded', function () {
    // 检查是否已登录
    const token = localStorage.getItem('adminToken');
    // if (token) {
    //     window.location.href = 'dashboard.html';
    //     return;
    // }

    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const usersTableBody = document.querySelector('#usersTable tbody');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // 登录验证
        if (!username || !password) {
            showMessage('请输入用户名和密码', 'error');
            return;
        }

        // 发送登录请求
        fetch('http://localhost:5001/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showMessage(data.error, 'error');
                } else if (data.token) {
                    // 保存token
                    localStorage.setItem('adminToken', data.token);
                    showMessage('登录成功，正在跳转...', 'success');

                    // 跳转
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
            })
            .catch(error => {
                showMessage('登录失败，请稍后再试', 'error');
                console.error('Login error:', error);
            });
    });

    function showMessage(text, type) {
        loginMessage.textContent = text;
        loginMessage.className = 'message ' + type;
    }
});

// 检查管理员是否已登录
function checkAdminAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}