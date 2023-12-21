import jwt from 'jsonwebtoken';

const generarJWT = datos => jwt.sign({ id: datos.id, nombre: datos.nombre }, process.env.JWT_SECRET, { expiresIn: '1d' })


// Token de verificacion temporal de cuentas (para identificar cual cuenta es cual al momento de registrarse y generar una autenticacion etc...)
const generarToken = () => Math.random().toString(32).substring(2) + Date.now().toString()

export {
    generarJWT,
    generarToken
}