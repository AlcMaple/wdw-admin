document.addEventListener('DOMContentLoaded', function () {
    // 检查登录状态
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 获取页面元素
    const totalUsersEl = document.getElementById('totalUsers');
    const totalSongsEl = document.getElementById('totalSongs');
    const storageUsedEl = document.getElementById('storageUsed');
    const logoutBtn = document.getElementById('logoutBtn');

    // 退出登录
    logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('adminToken');
        window.location.href = 'index.html';
    });

    // 加载仪表盘数据
    loadDashboardData();

    function loadDashboardData() {
        fetch('http://localhost:5001/admin/stats', {
            headers: {
                'Authorization': token
            }
        })
            .then(response => {
                if (response.status === 401) {
                    // 未授权，跳转到登录页
                    localStorage.removeItem('adminToken');
                    window.location.href = 'index.html';
                    throw new Error('Unauthorized');
                }
                return response.json();
            })
            .then(data => {
                // 更新页面数据
                totalUsersEl.textContent = data.totalUsers || 0;
                totalSongsEl.textContent = data.totalSongs || 0;

                // 格式化存储空间
                const storageGB = (data.storageUsed / (1024 * 1024 * 1024)).toFixed(2);
                storageUsedEl.textContent = `${storageGB} GB`;
            })
            .catch(error => {
                console.error('Error loading dashboard data:', error);
                // 处理错误情况
                totalUsersEl.textContent = '获取失败';
                totalSongsEl.textContent = '获取失败';
                storageUsedEl.textContent = '获取失败';
            });
    }
});