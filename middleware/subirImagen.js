import multer from 'multer'
import path from 'path'
import { generarToken } from '../helpers/tokens.js'


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, generarToken() + path.extname(file.originalname) )
    }
})

const upload = multer({ storage })

export default upload