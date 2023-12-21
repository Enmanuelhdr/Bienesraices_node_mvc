import express from "express"
import {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmacionCuenta,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    cerrarSesion
} from "../controllers/usuarioController.js"

const router = express.Router();

// Rutas para el login de usuarios
router.get('/login', formularioLogin);
router.post('/login', autenticar);

// Cerrar sesion
router.post('/cerrar-sesion', cerrarSesion)


// Rutas para el registro de usuarios
router.get('/registro', formularioRegistro)
router.post('/registro', registrar)

// Confirmacion de contrseña
router.get('/confirmar/:token', confirmacionCuenta)

// Rutas para el Forgoten Password
router.get('/olvide-password', formularioOlvidePassword)
router.post('/olvide-password', resetPassword)

//almacenar nuevo password
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)




export default router