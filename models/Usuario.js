import { Sequelize } from "sequelize";
import bcrypt from 'bcrypt';
import db from '../config/db.js'

const Usuario = db.define('usuarios', {
    nombre: {
        type: Sequelize.STRING(60),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(60),
        allowNull: false
    },
    password: {
        type: Sequelize.STRING(60),
        allowNull: false
    },
    token: {
        type: Sequelize.STRING(60),
    },
    confirmado: {
        type: Sequelize.BOOLEAN,
    },
}, {
    hooks: {
        beforeCreate: async function (usuario) {
            const salt = await bcrypt.genSalt(10)
            usuario.password = await bcrypt.hash(usuario.password, salt)
        }
    },
    scopes: {
        eliminarPassword: {
            attributes: {
                exclude: ['password', 'token', 'confirmado', 'createdAt', 'updatedAt']
            }
        }
    }
});


// METODOS PERSONALIZADOS
Usuario.prototype.verificarPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}


export default Usuario;