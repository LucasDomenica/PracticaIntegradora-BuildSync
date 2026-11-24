const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['arquitecto', 'capataz', 'albañil'],
        default: 'arquitecto'
    }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);
module.exports = Usuario;
