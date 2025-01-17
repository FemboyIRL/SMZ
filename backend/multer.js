const multer = require("multer")
const path = require("path")

const MIMETYPES = [
    "image/jpeg",
    "image/png",
    "image/gif"
]

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "/uploads"))
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now()
        const ext = path.extname(file.originalname)
        cb(null, `${file.fieldname}-${timestamp}${ext}`)
    }
})

const fileFilter = (req, file, cb) => {
    if (MIMETYPES.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Solo se permiten archivos de imagen (JPG, PNG, GIF)."), false)
    }
}

const multerUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

module.exports = multerUpload
