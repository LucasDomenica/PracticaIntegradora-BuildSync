const rolSelect = document.getElementById("rol");
const identifierLabel = document.getElementById("identifierLabel");
const identifierInput = document.getElementById("email");

if (rolSelect && identifierLabel && identifierInput) {
    rolSelect.addEventListener("change", function () {
        if (this.value === "arquitecto") {
            identifierLabel.textContent = "Correo Electrónico:";
            identifierInput.type = "email";
            identifierInput.placeholder = "";
        } else {
            identifierLabel.textContent = "Nombre de Usuario:";
            identifierInput.type = "text";
            identifierInput.placeholder = "Nombre asignado por el admin";
        }
    });
}

document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const rol = rolSelect ? rolSelect.value : "arquitecto";
    const identifier = identifierInput.value.trim();
    const password = document.getElementById("password").value;

    const payload = rol === "arquitecto"
        ? { correo: identifier, password, rol }
        : { nombre: identifier, password, rol };

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Inicio de sesión exitoso');
            const userRol = result.rol || rol;
            localStorage.setItem('userRol', userRol);
            localStorage.setItem('userNombre', result.nombre || identifier);
            if (userRol === 'arquitecto') {
                localStorage.setItem('userEmail', identifier);
                window.location.href = 'admin.html';
            } else if (userRol === 'capataz') {
                localStorage.setItem('userEmail', result.nombre || identifier);
                window.location.href = 'capataz.html';
            } else {
                localStorage.setItem('userEmail', result.nombre || identifier);
                window.location.href = 'albañil.html';
            }
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        alert('Error al conectar con el servidor');
        console.error(error);
    }
});
