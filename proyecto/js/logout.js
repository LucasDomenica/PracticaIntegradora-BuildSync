const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRol');
        localStorage.removeItem('userNombre');
        window.location.href = 'login.html';
    });
}
