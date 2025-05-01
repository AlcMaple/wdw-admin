document.addEventListener('DOMContentLoaded', function () {
    // 检查登录状态
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 页面元素
    const musicTableBody = document.querySelector('#musicTable tbody');
    const searchInput = document.getElementById('musicSearchInput');
    const searchBtn = document.getElementById('musicSearchBtn');
    const userFilter = document.getElementById('userFilter');
    const typeFilter = document.getElementById('typeFilter');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    // 模态框元素
    const musicDetailModal = document.getElementById('musicDetailModal');
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deleteMusicName = document.getElementById('deleteMusicName');

    // 音乐详情元素
    const musicDetailId = document.getElementById('musicDetailId');
    const musicDetailName = document.getElementById('musicDetailName');
    const musicDetailArtist = document.getElementById('musicDetailArtist');
    const musicDetailUsername = document.getElementById('musicDetailUsername');
    const musicDetailType = document.getElementById('musicDetailType');
    const musicDetailSize = document.getElementById('musicDetailSize');
    const musicDetailCreatedAt = document.getElementById('musicDetailCreatedAt');
    const musicCover = document.getElementById('musicCover');
    const musicPlayer = document.getElementById('musicPlayer');

    // 分页参数
    let currentPage = 1;
    let searchQuery = '';
    let selectedUser = '';
    let selectedType = '';
    let currentMusicId = null;

    // 加载用户下拉列表
    loadUserOptions();

    // 加载音乐列表
    loadMusic();

    // 搜索功能
    searchBtn.addEventListener('click', function () {
        searchQuery = searchInput.value.trim();
        currentPage = 1;
        loadMusic();
    });

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value.trim();
            currentPage = 1;
            loadMusic();
        }
    });

    // 筛选功能
    userFilter.addEventListener('change', function () {
        selectedUser = this.value;
        currentPage = 1;
        loadMusic();
    });

    // typeFilter.addEventListener('change', function () {
    //     selectedType = this.value;
    //     currentPage = 1;
    //     loadMusic();
    // });

    // 分页功能
    prevPageBtn.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            loadMusic();
        }
    });

    nextPageBtn.addEventListener('click', function () {
        currentPage++;
        loadMusic();
    });

    // 退出登录
    logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('adminToken');
        window.location.href = 'index.html';
    });

    // 关闭
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            musicDetailModal.style.display = 'none';
            confirmDeleteModal.style.display = 'none';

            // 停止音乐播放
            musicPlayer.pause();
            musicPlayer.currentTime = 0;
        });
    });

    window.addEventListener('click', function (event) {
        if (event.target === musicDetailModal) {
            musicDetailModal.style.display = 'none';
            musicPlayer.pause();
            musicPlayer.currentTime = 0;
        }
        if (event.target === confirmDeleteModal) {
            confirmDeleteModal.style.display = 'none';
        }
    });

    // 取消删除
    cancelDeleteBtn.addEventListener('click', function () {
        confirmDeleteModal.style.display = 'none';
    });

    // 确认删除
    confirmDeleteBtn.addEventListener('click', function () {
        if (currentMusicId) {
            deleteMusic(currentMusicId);
        }
    });

    // 加载用户选项
    function loadUserOptions() {
        fetch('http://localhost:5001/admin/users/all', {
            headers: {
                'Authorization': token
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.users && data.users.length > 0) {
                    let optionsHTML = '<option value="">全部用户</option>';
                    data.users.forEach(user => {
                        optionsHTML += `<option value="${user.id}">${user.username}</option>`;
                    });
                    userFilter.innerHTML = optionsHTML;
                }
            })
            .catch(error => {
                console.error('Error loading user options:', error);
            });
    }

    // 加载音乐列表
    function loadMusic() {
        let url = `http://localhost:5001/admin/music?page=${currentPage}`;

        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        if (selectedUser) {
            url += `&user_id=${selectedUser}`;
        }

        // if (selectedType) {
        //     url += `&playlist_type=${selectedType}`;
        // }

        musicTableBody.innerHTML = '<tr><td colspan="7" class="loading-text">加载中...</td></tr>';

        const token = localStorage.getItem('adminToken');

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

                if (response.status === 500) {
                    return response.json().then(errorData => {
                        console.error("服务器错误详情:", errorData);
                        throw new Error(`服务器错误: ${errorData.error || '未知错误'}`);
                    });
                }

                return response.json();
            })
            .then(data => {
                if (data.music && data.music.length > 0) {
                    let tableHTML = '';
                    data.music.forEach(music => {
                        // 格式化文件大小
                        const fileSizeMB = ((music.file_size || 0) / (1024 * 1024)).toFixed(2);

                        // 根据音乐类型设置显示内容
                        const is_api_music = music.is_api_music;
                        console.log("is_global_music", is_api_music);

                        // 对于API音乐，不显示用户和歌单类型
                        const username = is_api_music ? '-' : (music.username || '未知用户');

                        // // 根据歌单类型获取文本描述
                        // let typeText = '未知';
                        // if (music.playlist_type === 1) typeText = '云音乐';
                        // if (music.playlist_type === 2) typeText = '我的歌单';
                        // if (music.playlist_type === 3) typeText = '我喜欢的音乐';

                        // // 对于API音乐，歌单类型为"全局"
                        // const displayType = is_api_music ? '全局' : typeText;

                        // 禁用状态
                        const isDisabled = music.is_disabled ? 'disabled' : '';
                        const disableButtonText = music.is_disabled ? '解除禁用' : '禁用';
                        const disableButtonIcon = music.is_disabled ? 'fa-play-circle' : 'fa-ban';

                        // 只对API音乐显示禁用按钮
                        const toggleButton = is_api_music ?
                            `<button class="action-btn toggle-btn" data-id="${music.music_id}" data-disabled="${music.is_disabled}">
                        <i class="fas ${disableButtonIcon}"></i> ${disableButtonText}
                    </button>` : '';

                        tableHTML += `
                    <tr class="${isDisabled}">
                        <td>${music.music_id}</td>
                        <td>${music.name}</td>
                        <td>${music.artist || '未知'}</td>
                        <td>${username}</td>
                        <td>${fileSizeMB} MB</td>
                        <td>
                            <button class="action-btn view-btn" data-id="${music.music_id}">
                                <i class="fas fa-eye"></i> 查看
                            </button>
                            ${toggleButton}
                        </td>
                    </tr>
                `;
                    });
                    musicTableBody.innerHTML = tableHTML;

                    // 查看按钮
                    document.querySelectorAll('.view-btn').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const musicId = this.getAttribute('data-id');
                            showMusicDetail(musicId);
                        });
                    });

                    // 禁用/启用按钮
                    document.querySelectorAll('.toggle-btn').forEach(btn => {
                        btn.addEventListener('click', function () {
                            const musicId = this.getAttribute('data-id');
                            const isDisabled = this.getAttribute('data-disabled') === 'true';
                            toggleDisableMusic(musicId, isDisabled);
                        });
                    });

                    // 更新分页信息
                    pageInfo.textContent = `第 ${currentPage} 页`;
                    prevPageBtn.disabled = currentPage <= 1;
                    nextPageBtn.disabled = data.music.length < 10; // 每页10条
                } else {
                    musicTableBody.innerHTML = '<tr><td colspan="7" class="loading-text">暂无音乐数据</td></tr>';
                    prevPageBtn.disabled = true;
                    nextPageBtn.disabled = true;
                }
            })
            .catch(error => {
                console.error('Error loading music:', error);
                musicTableBody.innerHTML = '<tr><td colspan="7" class="loading-text">加载失败</td></tr>';
            });
    }

    // 音乐详情
    function showMusicDetail(musicId) {
        const token = localStorage.getItem('adminToken');

        fetch(`http://localhost:5001/admin/music/${musicId}`, {
            headers: {
                'Authorization': token
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.music) {
                    const music = data.music;
                    currentMusicId = music.music_id;

                    // 详情信息
                    musicDetailId.textContent = music.music_id;
                    musicDetailName.textContent = music.name;
                    musicDetailArtist.textContent = music.artist || '未知';

                    // 处理用户名显示
                    musicDetailUsername.textContent = music.is_api_music ? '-' : (music.username || '未知用户');

                    // 格式化文件大小
                    const fileSizeMB = ((music.file_size || 0) / (1024 * 1024)).toFixed(2);
                    musicDetailSize.textContent = `${fileSizeMB} MB`;

                    // 格式化创建时间
                    musicDetailCreatedAt.textContent = formatDate(music.created_at);

                    // 设置封面
                    musicCover.src = music.pic_url || 'https://via.placeholder.com/140';
                    musicCover.onerror = function () {
                        this.src = 'https://via.placeholder.com/140'; // 封面加载失败时使用占位图
                    };

                    musicDetailModal.style.display = 'block';
                } else {
                    alert('获取音乐信息失败');
                }
            })
            .catch(error => {
                console.error('Error fetching music details:', error);
                alert('获取音乐信息失败');
            });
    }

    // 删除音乐
    function deleteMusic(musicId) {
        const token = localStorage.getItem('adminToken');

        fetch(`http://localhost:5001/admin/music/${musicId}`, {
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
                    musicDetailModal.style.display = 'none';
                    loadMusic(); // 重新加载音乐列表
                } else {
                    alert(data.message || '删除失败');
                }
            })
            .catch(error => {
                console.error('Error deleting music:', error);
                alert('删除失败，请稍后再试');
            });
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    // 控制音乐权限
    function toggleDisableMusic(musicId, currentState) {
        const actionText = currentState ? '解除禁用' : '禁用';
        if (!confirm(`确定要${actionText}这首音乐吗？`)) {
            return;
        }

        const token = localStorage.getItem('adminToken');

        fetch(`http://localhost:5001/admin/music/${musicId}/toggle-disable`, {
            method: 'POST',
            headers: {
                'Authorization': token
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    loadMusic(); // 重新加载音乐列表
                } else {
                    alert(data.message || '操作失败');
                }
            })
            .catch(error => {
                console.error('Error toggling music state:', error);
                alert('操作失败，请稍后再试');
            });
    }
});