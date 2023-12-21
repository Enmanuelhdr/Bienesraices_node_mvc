import { unlink } from 'node:fs/promises'
import { validationResult } from 'express-validator'
import { Precio, Categoria, Propiedad, Mensaje, Usuario } from '../models/index.js'
import { esVendedor, formatearFecha } from '../helpers/index.js'

const admin = async (req, res) => {

    // Leer QueryString
    const { pagina: paginaActual } = req.query

    // Expresion regular para que solo se permitan numeros
    const expresion = /^[1-9]$/

    // Validacion del QueryString por medio de la expresion regular
    if (!expresion.test(paginaActual)) {
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try {
        const { id } = req.usuario

        // Limites y Offset para el paginador
        const limit = 10;
        const offset = ((paginaActual * limit) - limit)

        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: {
                    usuarioId: id
                },
                include: [
                    {
                        model: Categoria, as: 'categoria',

                    },
                    {
                        model: Precio, as: 'precio',
                    },
                    {
                        model: Mensaje, as: 'mensajes',
                    }
                ]
            }),
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
        ])

        res.render('propiedades/admin', {
            pagina: 'Mis propiedades',
            csrfToken: req.csrfToken(),
            propiedades,
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            offset,
            limit,
            total,
        })

    } catch (error) {
        console.log(error);
    }
}

// Formulario para crear
// Get
const crear = async (req, res) => {

    // consultar modelo de precio y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        navBar: true,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}


// Post
const guardar = async (req, res) => {

    // Resultado de la validacion - validacion
    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {

        // consultar modelo de precio y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            navBar: true,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body,
        })
    }

    // Crear un registro

    const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body;

    const { id: usuarioId } = req.usuario;

    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''

        })

        const { id } = propiedadGuardada;

        res.redirect(`/propiedades/agregar-imagen/${id}`)

    } catch (error) {
        console.log(error);
    }
}

// Agregar imagen
// Get
const agregarImagen = async (req, res) => {

    const { id } = req.params


    // Validad que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Validad que la propiedad no este publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }
    // Validad que la propiedad pertenece a quien visita la pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad,

    })
}

// Post
const almacenarImagen = async (req, res, next) => {
    const { id } = req.params


    // Validad que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Validad que la propiedad no este publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    // Validad que la propiedad pertenece a quien visita la pagina
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    try {
        // almacenar la imagen y publicar la propiedad
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1
        await propiedad.save()
        next()
    } catch (error) {
        console.log(error);
    }
}

// Editar
// Get
const editar = async (req, res) => {

    // Obtener datos
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)

    // Valida que la propiedad exista
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Revisar quien visita la url
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }

    // Consultar modelo de precio y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    // Renderizar pagina
    res.render('propiedades/editar', {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    })
}

// Post
const guardarCambios = async (req, res) => {

    // Verificar la validacion
    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {

        // consultar modelo de precio y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/editar', {
            pagina: 'Editar Propiedad',
            navBar: true,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body,
        })
    }

    // Obtener datos
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)

    // Valida que la propiedad exista
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Revisar quien visita la url
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }

    // Consultar modelo de precio y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    // Reescribir el objeto y actualizarlo
    try {
        const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body;

        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        })

        await propiedad.save()

        res.redirect('/mis-propiedades')

    } catch (error) {
        console.log(error);
    }

    // Renderizar pagina
    return res.render('propiedades/editar', {
        pagina: 'Editar Propiedad',
        navBar: true,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        errores: resultado.array(),
        datos: req.body,
    })
}


// Eliminar departamentos
const eliminar = async (req, res) => {

    // Obtener datos
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)


    // Valida que la propiedad exista
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Revisar quien visita la url
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }

    // Eliminar la imagen
    await unlink(`public/uploads/${propiedad.imagen}`)
    console.log(`Se elimino la imagen correctamente: ${propiedad.imagen}`);


    // Elminiar la propiedad
    await propiedad.destroy()
    res.redirect('/mis-propiedades')
}

// Modificando el estado de la propiedad
const cambiarEstado = async (req, res) => {
    // Obtener datos
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id)


    // Valida que la propiedad exista
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Revisar quien visita la url
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }

    // Actualizar
    propiedad.publicado = !propiedad.publicado

    await propiedad.save()

    res.json({
        resultado: true
    })
}

const mostrarPropiedad = async (req, res) => {

    // Tomar datos 
    const { id } = req.params;

    // Comprobar que la propiedad existe
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {
                model: Categoria, as: 'categoria',

            },
            {
                model: Precio, as: 'precio',
            }
        ]
    })

    if (!propiedad || !propiedad.publicado) {
        res.redirect('/404')
    } else {
        res.render('propiedades/mostrar', {
            pagina: propiedad.titulo,
            propiedad,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)
        })
    }
}

const enviarMensaje = async (req, res) => {
    // Tomar datos 
    const { id } = req.params;

    // Comprobar que la propiedad existe
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {
                model: Categoria, as: 'categoria',

            },
            {
                model: Precio, as: 'precio',
            }
        ]
    })

    if (!propiedad) {
        res.redirect('/404')
    }

    // Renderizar los errores

    let resultado = validationResult(req)

    if (!resultado.isEmpty()) {

        return res.render('propiedades/mostrar', {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array(),
        })
    }

    const { mensaje } = req.body
    const { id: propiedadId } = req.params
    const { id: usuarioId } = req.usuario


    // Almacenar mensaje
    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    res.render('propiedades/mostrar', {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
        enviado: true
    })

}

// Leer mensajes recibidos
const verMensajes = async (req, res) => {

    // Obtener datos
    const { id } = req.params
    const propiedad = await Propiedad.findByPk(id, {

        include: [
            {
                model: Mensaje, as: 'mensajes',
                    include: [
                        {
                            model: Usuario.scope('eliminarPassword'), as: 'usuario'
                        }
                    ]
            }
        ]
    })


    // Valida que la propiedad exista
    if (!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Revisar quien visita la url
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }


    res.render('propiedades/mensajes', {
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha,
    })
}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    cambiarEstado,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes,
}