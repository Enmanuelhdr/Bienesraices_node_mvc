import express from 'express';
import { body } from 'express-validator'
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, mostrarPropiedad, enviarMensaje, verMensajes, cambiarEstado } from '../controllers/propiedadController.js'
import protegerRuta from '../middleware/protegerRuta.js';
import upload from '../middleware/subirImagen.js'
import identificarUsuario from '../middleware/identificarUsuario.js'

const router = express.Router();

// AREA PRIVADA (NECESITA CUENTA)
router.get('/mis-propiedades', protegerRuta, admin)

// Propiedades crear
router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear', 
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion')
    .notEmpty().withMessage('La descripcion del anuncio es obligatoria')
    .isLength({max: 200}).withMessage("La descripcion es muy larga"),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona una cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona una cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona una cantidad de baños'),
    body('lat').isNumeric().withMessage('Indica la propiedad en el mapa'),
    guardar
)

// Agregar imagen
router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen)
router.post('/propiedades/agregar-imagen/:id', 
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
)

router.get('/propiedades/editar/:id',
    protegerRuta,
    editar
)
router.post('/propiedades/editar/:id', 
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion')
    .notEmpty().withMessage('La descripcion del anuncio es obligatoria')
    .isLength({max: 200}).withMessage("La descripcion es muy larga"),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona una cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona una cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona una cantidad de baños'),
    body('lat').isNumeric().withMessage('Indica la propiedad en el mapa'),
    guardarCambios
)

// Eliminar
router.post('/propiedades/eliminar/:id',
    protegerRuta,
    eliminar
)

//Cambiar estado
router.put('/propiedades/:id', protegerRuta, cambiarEstado)

// AREA PUBLICA (NO NECESITA CUENTA)
router.get('/propiedad/:id',
    identificarUsuario,
    mostrarPropiedad
)


// Almacenar los mensajes
router.post('/propiedad/:id',
    identificarUsuario,
    body('mensaje').isLength({min: 20}).withMessage('No puede ir vacio o es muy corto'),
    enviarMensaje
)

// ver mensajes
router.get('/mensajes/:id',
    protegerRuta,
    verMensajes
)



export default router