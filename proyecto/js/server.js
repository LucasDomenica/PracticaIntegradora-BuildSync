const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../atlas-credentials.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importar el paquete cors
const Usuario = require('./usuarios'); // Importa el modelo de Usuario
const bcrypt = require('bcrypt'); // Asegúrate de que esto esté en la parte superior de tu archivo
const app = express();
const PORT = 3000;

// Middleware para procesar los datos del formulario
app.use(cors()); // Usar CORS para permitir solicitudes de otros orígenes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "script-src 'self';");
    next();
});

// Conectar a MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/usuarios';
mongoose.connect(mongoUri, {
    dbName: 'usuarios'
})
    .then(async () => {
        console.log('Conectado a MongoDB');
        try {
            const indexes = await Usuario.collection.indexes();
            const correoIdx = indexes.find(idx => idx.name === 'correo_1');
            if (correoIdx && !correoIdx.sparse) {
                await Usuario.collection.dropIndex('correo_1');
                await Usuario.syncIndexes();
                console.log('Índice correo_1 actualizado a sparse');
            }
        } catch (e) {
            console.error('Error al verificar índices:', e.message);
        }
    })
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Ruta para registro de usuarios
app.post('/registro', async (req, res) => {
    const { nombre, correo, password } = req.body;

    try {
        const usuarioExistente = await Usuario.findOne({ correo });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const passwordHasheado = await bcrypt.hash(password, 10);
        const nuevoUsuario = new Usuario({ nombre, correo, password: passwordHasheado, rol: 'arquitecto' });
        await nuevoUsuario.save();

        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error(error); // Muestra el error en la consola
        res.status(500).json({ error: 'Error en el servidor. Intente más tarde.' });
    }
});

// Ruta para crear capataz o albañil desde el panel de admin
app.post('/usuarios-rol', async (req, res) => {
    const { nombre, password, rol } = req.body;

    if (!nombre || !password || !['capataz', 'albañil'].includes(rol)) {
        return res.status(400).json({ error: 'Nombre, contraseña y rol válido (capataz o albañil) son obligatorios.' });
    }

    try {
        const usuarioExistente = await Usuario.findOne({ nombre, rol });
        if (usuarioExistente) {
            return res.status(400).json({ error: `Ya existe un ${rol} con ese nombre.` });
        }

        const passwordHasheado = await bcrypt.hash(password, 10);
        const nuevoUsuario = new Usuario({ nombre, password: passwordHasheado, rol });
        await nuevoUsuario.save();

        res.status(201).json({ message: `${rol} creado con éxito`, usuario: { nombre, rol } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor. Intente más tarde.' });
    }
});

// Ruta para listar usuarios por rol (capataz o albañil)
app.get('/usuarios-rol/:rol', async (req, res) => {
    const { rol } = req.params;
    if (!['capataz', 'albañil'].includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido' });
    }

    try {
        const usuarios = await Usuario.find({ rol }, 'nombre rol -_id');
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener usuarios.' });
    }
});

// Ruta para inicio de sesión
app.post('/login', async (req, res) => {
    const { correo, nombre, password, rol } = req.body;

    try {
        let usuario;
        if (rol === 'capataz' || rol === 'albañil') {
            const username = nombre || correo;
            if (!username) {
                return res.status(400).json({ error: 'Debe ingresar su nombre de usuario.' });
            }
            usuario = await Usuario.findOne({ nombre: username, rol });
        } else {
            if (!correo) {
                return res.status(400).json({ error: 'Debe ingresar su correo electrónico.' });
            }
            usuario = await Usuario.findOne({ correo });
        }

        if (!usuario) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        // Compara la contraseña proporcionada con la contraseña hasheada
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Si las credenciales son correctas, envía una respuesta exitosa
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            rol: usuario.rol || 'arquitecto',
            nombre: usuario.nombre
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor. Intente más tarde.' });
    }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
