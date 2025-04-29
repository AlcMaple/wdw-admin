document.addEventListener('DOMContentLoaded', function () {
    // 检查登录状态
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 页面元素
    const usersTableBody = document.querySelector('#usersTable tbody');
    const searchInput = document.getElementById('userSearchInput');
    const searchBtn = document.getElementById('userSearchBtn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    // 模态框元素
    const userDetailModal = document.getElementById('userDetailModal');
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deleteUserName = document.getElementById('deleteUserName');

    // 重置密码元素
    const resetUserName = document.getElementById('resetUserName');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const confirmResetBtn = document.getElementById('confirmResetBtn');

    // 用户详情元素
    const userDetailId = document.getElementById('userDetailId');
    const userDetailUsername = document.getElementById('userDetailUsername');
    const userDetailNickname = document.getElementById('userDetailNickname');
    const userDetailCreatedAt = document.getElementById('userDetailCreatedAt');
    const userDetailIntro = document.getElementById('userDetailIntro');
    const userAvatar = document.getElementById('userAvatar');
    const userDetailSongCount = document.getElementById('userDetailSongCount');
    const userDetailStorage = document.getElementById('userDetailStorage');
    const userDetailQuestion = document.getElementById('userDetailSecurityQuestion');
    const userDetailAnswer = document.getElementById('userDetailSecurityAnswer');

    // 分页参数
    let currentPage = 1;
    let searchQuery = '';
    let currentUserId = null;

    // 加载用户列表
    loadUsers();

    // 搜索功能
    searchBtn.addEventListener('click', function () {
        searchQuery = searchInput.value.trim();
        currentPage = 1;
        loadUsers();
    });

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value.trim();
            currentPage = 1;
            loadUsers();
        }
    });

    // 分页功能
    prevPageBtn.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            loadUsers();
        }
    });

    nextPageBtn.addEventListener('click', function () {
        currentPage++;
        loadUsers();
    });

    // 退出登录
    logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('adminToken');
        window.location.href = 'index.html';
    });

    // 关闭模态框
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            userDetailModal.style.display = 'none';
            confirmDeleteModal.style.display = 'none';
            resetPasswordModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function (event) {
        if (event.target === userDetailModal) {
            userDetailModal.style.display = 'none';
        }
        if (event.target === confirmDeleteModal) {
            confirmDeleteModal.style.display = 'none';
        }
        if (event.target === resetPasswordModal) {
            resetPasswordModal.style.display = 'none';
        }
    });

    // 取消删除
    cancelDeleteBtn.addEventListener('click', function () {
        confirmDeleteModal.style.display = 'none';
    });

    // 确认删除
    confirmDeleteBtn.addEventListener('click', function () {
        if (currentUserId) {
            deleteUser(currentUserId);
        }
    });

    // 重置密码
    if (cancelResetBtn) {
        cancelResetBtn.addEventListener('click', function () {
            console.log("取消重置密码被点击");
            resetPasswordModal.style.display = 'none';
            newPassword.value = '';
            confirmPassword.value = '';
        });
    }

    if (confirmResetBtn) {
        confirmResetBtn.addEventListener('click', function () {
            console.log("确认重置密码被点击");
            resetUserPassword();
        });
    }

    // 加载用户列表
    function loadUsers() {
        const token = localStorage.getItem('adminToken');
        let url = `http://localhost:5001/admin/users?page=${currentPage}`;

        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        usersTableBody.innerHTML = '<tr><td colspan="5" class="loading-text">加载中...</td></tr>';

        fetch(url, {
            headers: {
                'Authorization': token
            }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem('adminToken');
                    window.location.href = 'index.html';
                    throw new Error('Unauthorized');
                }
                return response.json();
            })
            .then(data => {
                if (data.users && data.users.length > 0) {
                    let tableHTML = '';
                    data.users.forEach(user => {
                        tableHTML += `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.nickname || '-'}</td>
                            <td>${formatDate(user.created_at)}</td>
                            <td>
                                <button class="action-btn view-btn" data-id="${user.id}">
                                    <i class="fas fa-eye"></i> 查看
                                </button>
                                <button class="action-btn reset-btn" data-id="${user.id}" data-name="${user.username}">
                                    <i class="fas fa-key"></i> 重置密码
                                </button>
                                <button class="action-btn delete-btn" data-id="${user.id}" data-name="${user.username}">
                                    <i class="fas fa-trash"></i> 删除
                                </button>
                            </td>
                        </tr>
                    `;
                    });
                    usersTableBody.innerHTML = tableHTML;

                    // 按钮点击事件
                    document.querySelectorAll('.view-btn').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const userId = this.getAttribute('data-id');
                            showUserDetail(userId);
                        });
                    });

                    document.querySelectorAll('.reset-btn').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const userId = this.getAttribute('data-id');
                            const userName = this.getAttribute('data-name');
                            currentUserId = userId;
                            resetUserName.textContent = userName;
                            resetPasswordModal.style.display = 'block';
                        });
                    });

                    document.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const userId = this.getAttribute('data-id');
                            const userName = this.getAttribute('data-name');
                            currentUserId = userId;
                            deleteUserName.textContent = userName;
                            confirmDeleteModal.style.display = 'block';
                        });
                    });

                    // 更新分页信息
                    pageInfo.textContent = `第 ${currentPage} 页`;
                    prevPageBtn.disabled = currentPage <= 1;
                    nextPageBtn.disabled = data.users.length < 10; // 每页10条
                } else {
                    usersTableBody.innerHTML = '<tr><td colspan="5" class="loading-text">暂无用户数据</td></tr>';
                    prevPageBtn.disabled = true;
                    nextPageBtn.disabled = true;
                }
            })
            .catch(error => {
                console.error('Error loading users:', error);
                usersTableBody.innerHTML = '<tr><td colspan="5" class="loading-text">加载失败</td></tr>';
            });
    }

    // 显示用户详情
    function showUserDetail(userId) {
        const token = localStorage.getItem('adminToken');

        fetch(`http://localhost:5001/admin/users/${userId}`, {
            headers: {
                'Authorization': token
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.user) {
                    const user = data.user;
                    currentUserId = user.id;

                    userDetailId.textContent = user.id;
                    userDetailUsername.textContent = user.username;
                    userDetailNickname.textContent = user.nickname || '-';
                    userDetailCreatedAt.textContent = formatDate(user.created_at);
                    userDetailIntro.textContent = user.intro || '暂无简介';
                    // 密保问题和密保答案
                    userDetailQuestion.textContent = user.security_question || '暂无密保问题';
                    userDetailAnswer.textContent = user.security_answer || '暂无密保答案';


                    // 设置头像
                    userAvatar.src = user.avatar_url || 'https://via.placeholder.com/100';
                    userAvatar.onerror = function () {
                        this.src = 'https://via.placeholder.com/100'; // 头像加载失败处理
                    };

                    // 设置统计信息
                    userDetailSongCount.textContent = data.statistics?.song_count || 0;

                    // 格式化存储空间
                    const storageMB = ((data.statistics?.storage_used || 0) / (1024 * 1024)).toFixed(2);
                    userDetailStorage.textContent = `${storageMB} MB`;

                    userDetailModal.style.display = 'block';
                } else {
                    alert('获取用户信息失败');
                }
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                alert('获取用户信息失败');
            });
    }

    // 删除用户
    function deleteUser(userId) {
        const token = localStorage.getItem('adminToken');

        fetch(`http://localhost:5001/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('删除成功');
                    confirmDeleteModal.style.display = 'none';
                    userDetailModal.style.display = 'none';
                    loadUsers(); // 重新加载用户列表
                } else {
                    alert(data.message || '删除失败');
                }
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                alert('删除失败，请稍后再试');
            });
    }

    // 重置用户密码
    function resetUserPassword() {
        console.log("执行重置密码函数");

        const userId = currentUserId;
        const password = newPassword.value;
        const confirmPwd = confirmPassword.value;

        if (!password || !confirmPwd) {
            alert('请输入密码');
            return;
        }

        if (password !== confirmPwd) {
            alert('两次密码输入不一致');
            return;
        }

        const token = localStorage.getItem('adminToken');

        fetch(`http://localhost:5001/admin/users/${userId}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                new_password: password
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('密码重置成功');
                    resetPasswordModal.style.display = 'none';
                    newPassword.value = '';
                    confirmPassword.value = '';
                } else {
                    alert(data.message || '密码重置失败');
                }
            })
            .catch(error => {
                console.error('Error resetting password:', error);
                alert('密码重置失败，请稍后再试');
            });
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }
});