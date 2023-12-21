import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js';
import { generarJWT, generarToken } from '../helpers/tokens.js';
import { emailRegistro, emailRecuperacion } from '../helpers/emails.js';


// login
// get
const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar sesion',
        csrfToken: req.csrfToken()
    })
}

// post
const autenticar = async (req, res) => {
    // Validaciones
    await check('email').isEmail().withMessage('El Email es obligatorio').run(req)
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req)

    let resultadoValidacion = validationResult(req)

    // verificar que el resultado este vacio o no
    if (!resultadoValidacion.isEmpty()) {
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar sesion',
            csrfToken: req.csrfToken(),
            errores: resultadoValidacion.array(),
        })
    }

    const { email, password } = req.body

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email } })

    if (!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesion',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario no es valido' }],
        })
    }

    // Verificar si la cuenta esta confirmada
    if (!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesion',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario no esta confirmado, confirma tu cuenta' }],
        })
    }

    // Revisar el password
    if (!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesion',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El password es incorrecto' }],
        })
    }

    // Autenticar usuario
    const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });

    // Almacenar en un cookie (cookie parser)
    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true, *solo en el deployment si el host permite tener un certificado ssl
    }).redirect('/mis-propiedades')
}

// Cerrar sesion
const cerrarSesion = async (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

// Registro
//get
const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear cuenta',
        csrfToken: req.csrfToken()
    })
}

//post
const registrar = async (req, res) => {

    // Extraer los datos
    const { nombre, email, password, repetir_password } = req.body

    // Validacion
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req)
    await check('email').isEmail().withMessage('Eso no parece email').run(req)
    await check('password').isLength({ min: 6 }).withMessage('El password debe tener minimo 6 caracteres').run(req)
    await check('repetir_password').equals(repetir_password).withMessage('Las passwords no son iguales').run(req)

    //*Nota: Para el equals debo colocar directamente el dato como constante por medio del req.body, (vairblae) no ('texto entre comillas')

    let resultadoValidacion = validationResult(req)

    // verificar que el resultado este vacio
    if (!resultadoValidacion.isEmpty()) {
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            csrfToken: req.csrfToken(),
            errores: resultadoValidacion.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        })
    }

    // Verirficar que el email no este duplicado
    const existeUsuario = await Usuario.findOne({ where: { email } })

    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El email ya esta registrado' }],
            usuario: {
                nombre,
                email
            }
        })
    }

    // Almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarToken()
    });

    // Envia email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // Mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un Email de confimacion, presiona el siguiente enlace'
    })

}

// Funcion que comprueba una cuenta mediante el token
const confirmacionCuenta = async (req, res) => {
    const { token } = req.params;

    // Verificar si el toquen es valido
    const usuario = await Usuario.findOne({ where: { token } })

    if (!usuario) {
        res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    } else {
        // confirmar la cuenta
        usuario.token = null;
        usuario.confirmado = true;
        await usuario.save()

        res.render('auth/confirmar-cuenta', {
            pagina: 'Cuenta confirmada',
            mensaje: 'La cuenta se confirmo correctamente',

        })
    }
}

// Contraseña olvidada
//get
const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken(),
    })
}

//post
const resetPassword = async (req, res) => {

    await check('email').isEmail().withMessage('Eso no parece email').run(req)

    let resultadoValidacion = validationResult(req)

    // verificar que el resultado este vacio
    if (!resultadoValidacion.isEmpty()) {
        // Errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultadoValidacion.array(),
        })
    }

    // Buscar al usuario
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } })

    if (!usuario) {
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El email no pertenece a ningun usuario' }],
        });
    };

    // Generar token y enviar email
    usuario.token = generarToken();
    await usuario.save();

    // Eviar email
    emailRecuperacion({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // renderizar mensaje
    res.render('templates/mensaje', {
        pagina: 'Restablece tu password',
        mensaje: 'Hemos enviado un email con las instrucciones',
    })

}

//almacenar nuevo password
// get
const comprobarToken = async (req, res) => {
    const { token } = req.params;

    // Verificar si el toquen es valido
    const usuario = await Usuario.findOne({ where: { token } })

    if (!usuario) {
        res.render('auth/confirmar-cuenta', {
            pagina: 'Restablecer password',
            mensaje: 'Hubo un error al validar la informacion',
            error: true
        })
    }

    //Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Restablece tu password',
        csrfToken: req.csrfToken(),
    })
}

//post
const nuevoPassword = async (req, res) => {
    // Validacion
    await check('password').isLength({ min: 6 }).withMessage('El password debe tener minimo 6 caracteres').run(req)

    let resultadoValidacion = validationResult(req)

    // verificar que el resultado este vacio
    if (!resultadoValidacion.isEmpty()) {
        // Errores
        return res.render('auth/reset-password', {
            pagina: 'Restablece tu password',
            csrfToken: req.csrfToken(),
            errores: resultadoValidacion.array(),
        })
    }


    const { token } = req.params;
    const { password } = req.body;

    // Identificar al usuario
    const usuario = await Usuario.findOne({ where: { token } })

    // Hashear el nuevo password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    usuario.token = null;

    // Almacenar un usuario
    await usuario.save()

    // renderizar vista
    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Restablecido',
        mensaje: 'El password se guardo correctamente'
    })
}

export {
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

}