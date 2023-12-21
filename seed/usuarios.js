import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'Enmanuel',
        email: 'correo@correo.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    },
    {
        nombre: 'Enmanuel',
        email: 'correo@correo2.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    },
]

export default usuarios