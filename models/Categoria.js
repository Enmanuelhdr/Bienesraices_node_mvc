import { Sequelize } from "sequelize";
import db from '../config/db.js'

const Categoria = db.define('categorias', {
    nombre: {
        type: Sequelize.STRING(30),
        allowNull: false
    },
    
})

export default Categoria