import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/ususarioRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import db from './config/db.js';

// Crear la app
const app = express();

// Habliditar lectura de datos de usuario
app.use(express.urlencoded({ extended: true }))

// Habilitar cookie parser
app.use(cookieParser())

// Hablitar CSRF
app.use( csrf({ cookie: true }))


// Conexion a la base de datos
try {
    await db.authenticate();
    db.sync();
    console.log('Conexion correcta a la db');
} catch (error) {
    console.log(error);
}

//View engine
app.set('view engine', 'pug')
app.set('views', './views')

//Public
app.use(express.static('public'))

// Routing
app.use('/', appRoutes)
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/api', apiRoutes)






// Definir puerto y aarrancar el proyecto
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`El servidor esta en el puerto http://localhost:${port}`);
});