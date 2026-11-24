const userRole = 'capataz';  // Ejemplo, este valor se determinará dinámicamente

if (userRole === 'arquitecto') {
  document.getElementById('admin-panel').style.display = 'block';
} else if (userRole === 'capataz') {
  document.getElementById('capataz-panel').style.display = 'block';
} else {
  document.getElementById('albañil-panel').style.display = 'block';
}


const form = document.querySelector('form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const nombre = document.querySelector('#nombre').value;
  const correo = document.querySelector('#correo').value;
  const password = document.querySelector('#password').value;

  const response = await fetch('http://localhost:3000/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, password })
  });

  const result = await response.text();
  alert(result);
});
