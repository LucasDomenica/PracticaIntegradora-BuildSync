const userEmail = localStorage.getItem('userEmail');
const userRol = localStorage.getItem('userRol');
if (!userEmail || (userRol && userRol !== 'arquitecto')) {
    alert('No tienes permiso para acceder a esta página.');
    window.location.href = 'login.html';
}

const STORAGE_PROJECTS = 'buildsync_proyectos';

function loadList(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

async function fetchUsersByRol(rol) {
    try {
        const res = await fetch(`http://localhost:3000/usuarios-rol/${rol}`);
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

async function renderForemen() {
    const foremen = await fetchUsersByRol('capataz');
    const listEl = document.getElementById('foreman-list');
    const selectEl = document.getElementById('assign-foreman');

    listEl.innerHTML = '';
    selectEl.innerHTML = '<option value="">-- Selecciona un capataz --</option>';

    foremen.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user.nombre;
        listEl.appendChild(li);

        const option = document.createElement('option');
        option.value = user.nombre;
        option.textContent = user.nombre;
        selectEl.appendChild(option);
    });
}

async function renderAdminWorkers() {
    const workers = await fetchUsersByRol('albañil');
    const listEl = document.getElementById('admin-worker-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    workers.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user.nombre;
        listEl.appendChild(li);
    });
}

function renderProjects() {
    const projects = loadList(STORAGE_PROJECTS);
    const listEl = document.getElementById('project-list');
    listEl.innerHTML = '';

    projects.forEach((project) => {
        const li = document.createElement('li');
        const foremanText = project.foreman ? ` | Capataz: ${project.foreman}` : ' | Sin capataz asignado';
        li.textContent = `${project.name} (${project.startDate} - ${project.endDate}): ${project.description}${foremanText}`;
        listEl.appendChild(li);
    });
}

async function createWorkerUser(nombre, password, rol) {
    const res = await fetch('http://localhost:3000/usuarios-rol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, password, rol })
    });
    const data = await res.json();
    if (!res.ok) {
        alert(data.error || `Error al crear ${rol}`);
        return false;
    }
    return true;
}

const addForemanForm = document.getElementById('add-foreman-form');
if (addForemanForm) {
    addForemanForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const nameInput = document.getElementById('foreman-name');
        const passInput = document.getElementById('foreman-password');
        const nombre = nameInput.value.trim();
        const password = passInput.value;
        if (!nombre || !password) return;

        const ok = await createWorkerUser(nombre, password, 'capataz');
        if (ok) {
            addForemanForm.reset();
            await renderForemen();
            alert(`Capataz "${nombre}" creado con éxito.`);
        }
    });
}

const addWorkerAdminForm = document.getElementById('add-worker-admin-form');
if (addWorkerAdminForm) {
    addWorkerAdminForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const nameInput = document.getElementById('admin-worker-name');
        const passInput = document.getElementById('admin-worker-password');
        const nombre = nameInput.value.trim();
        const password = passInput.value;
        if (!nombre || !password) return;

        const ok = await createWorkerUser(nombre, password, 'albañil');
        if (ok) {
            addWorkerAdminForm.reset();
            await renderAdminWorkers();
            alert(`Albañil "${nombre}" creado con éxito.`);
        }
    });
}

const addProjectForm = document.getElementById('add-project-form');
if (addProjectForm) {
    addProjectForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('project-name').value.trim();
        const description = document.getElementById('project-description').value.trim();
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const foreman = document.getElementById('assign-foreman').value;

        if (!name || !description || !startDate || !endDate) return;

        const projects = loadList(STORAGE_PROJECTS);
        projects.push({ name, description, startDate, endDate, foreman });
        saveList(STORAGE_PROJECTS, projects);

        addProjectForm.reset();
        renderProjects();
    });
}

renderForemen();
renderAdminWorkers();
renderProjects();
