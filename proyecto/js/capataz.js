const STORAGE_PROJECTS = 'buildsync_proyectos';
const STORAGE_WORKERS = 'buildsync_albaniles';
const STORAGE_PROGRESS = 'buildsync_progreso';
const STORAGE_PHOTOS = 'buildsync_fotos';

function loadData(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function renderProjects() {
    const projects = loadData(STORAGE_PROJECTS, []);
    const progress = loadData(STORAGE_PROGRESS, null);
    const photos = loadData(STORAGE_PHOTOS, []);

    const infoEl = document.getElementById('project-info');
    const selectEl = document.getElementById('assign-project');

    selectEl.innerHTML = '<option value="">-- Selecciona un proyecto --</option>';
    projects.forEach((p) => {
        const option = document.createElement('option');
        option.value = p.name;
        option.textContent = p.name;
        selectEl.appendChild(option);
    });

    if (projects.length === 0) {
        infoEl.textContent = 'No hay proyectos asignados aún.';
    } else {
        const latest = projects[projects.length - 1];
        const progressText = progress !== null ? ` | Progreso: ${progress}%` : '';
        const photosText = photos.length > 0 ? ` | Fotos subidas: ${photos.join(', ')}` : '';
        infoEl.textContent = `${latest.name} (${latest.startDate} - ${latest.endDate}) - ${latest.description}${progressText}${photosText}`;
    }
}

function renderWorkers() {
    const workers = loadData(STORAGE_WORKERS, []);
    const listEl = document.getElementById('worker-list');
    listEl.innerHTML = '';

    workers.forEach((w) => {
        const li = document.createElement('li');
        li.textContent = w.project ? `${w.name} (Proyecto: ${w.project})` : w.name;
        listEl.appendChild(li);
    });
}

const progressForm = document.getElementById('progress-form');
if (progressForm) {
    progressForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const percentage = document.getElementById('progress-percentage').value;
        saveData(STORAGE_PROGRESS, percentage);
        renderProjects();
        alert(`Progreso guardado: ${percentage}%`);
    });
}

const photoForm = document.getElementById('photo-form');
if (photoForm) {
    photoForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const fileInput = document.getElementById('progress-photo');
        const file = fileInput.files[0];
        if (!file) return;

        const photos = loadData(STORAGE_PHOTOS, []);
        photos.push(file.name);
        saveData(STORAGE_PHOTOS, photos);
        photoForm.reset();
        renderProjects();
        alert(`Foto subida: ${file.name}`);
    });
}

const addWorkerForm = document.getElementById('add-worker-form');
if (addWorkerForm) {
    addWorkerForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const project = document.getElementById('assign-project').value;
        const nameInput = document.getElementById('worker-name');
        const name = nameInput.value.trim();
        if (!name) return;

        const workers = loadData(STORAGE_WORKERS, []);
        workers.push({ name, project });
        saveData(STORAGE_WORKERS, workers);
        nameInput.value = '';
        renderWorkers();
    });
}

renderProjects();
renderWorkers();
