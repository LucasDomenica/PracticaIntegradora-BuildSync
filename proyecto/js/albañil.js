const STORAGE_ATTENDANCE = 'buildsync_asistencia';

function loadAttendance() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_ATTENDANCE)) || [];
    } catch {
        return [];
    }
}

function renderAttendance() {
    const records = loadAttendance();
    const listEl = document.getElementById('attendance-history');
    listEl.innerHTML = '';

    records.forEach((entry) => {
        const li = document.createElement('li');
        li.textContent = entry;
        listEl.appendChild(li);
    });
}

const attendanceForm = document.getElementById('attendance-check-in');
if (attendanceForm) {
    attendanceForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const user = localStorage.getItem('userEmail') || 'Albañil';
        const timestamp = new Date().toLocaleString();
        const records = loadAttendance();
        records.push(`${user} - Asistencia registrada el ${timestamp}`);
        localStorage.setItem(STORAGE_ATTENDANCE, JSON.stringify(records));
        renderAttendance();
    });
}

renderAttendance();
