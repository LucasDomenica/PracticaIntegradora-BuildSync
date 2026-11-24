const registroForm = document.getElementById("registroForm");

if (registroForm) {
  registroForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    const resultElement = document.getElementById("result");

    try {
        const response = await fetch('http://localhost:3000/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, password })
        });

        const result = await response.json();
        if (response.ok) {
            resultElement.style.color = "green";
            resultElement.innerText = result.message || 'Registro exitoso';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);
        } else {
            resultElement.style.color = "red";
            resultElement.innerText = result.error || 'Error en el registro';
        }
    } catch (error) {
        resultElement.style.color = "red";
        resultElement.innerText = 'Error al conectar con el servidor';
    }
  });
}
