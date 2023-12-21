import { Sequelize } from "sequelize";
import db from '../config/db.js'

const propiedad = db.define('propiedades', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    titulo: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    habitaciones: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    estacionamiento:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    wc: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    calle: {
        type: Sequelize.STRING(60),
        allowNull: false
    },
    lat: {
        type: Sequelize.STRING(60),
        allowNull: false
    },
    lng: {
        type: Sequelize.STRING(60),
        allowNull: false
    },
    imagen: {
        type: Sequelize.STRING,
        allowNull: false
    },
    publicado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
})


export default propiedad