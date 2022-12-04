const multer = require('multer');

module.exports = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            console.log("entrei aqui no ");
            if (file.fieldname === "fotoPerfil") {
                cb(null, './public/upload/fotosPerfilUsuarios');    
            } 

        },
        filename: (req, file, cb) => {
            cb(null, Date.now().toString() + "_" + file.originalname)
        }
    }),
    fileFilter: (req, file, cb) => {
        const extensaoImg = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'video/mp4', 'video/webm'].find(formatoAceito => formatoAceito == file.mimetype);

        if (extensaoImg) {
            return cb(null, true);
        }

        return cb(null, false);
    }
}));









































/*const multer = require('multer');
const path = require('path');

module.exports = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            console.log("S")
            cb(null, './public/upload/sinais')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now().toString() + req.userId + path.extname(file.originalname));            
        }
    }),
    fileFilter: (req, file, cb) => {
        const extensaoImg = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'].find(formatoAceito => formatoAceito == file.mimetype);

        if(extensaoImg){
            return cb(null, true);
        }
        return cb(null, false);        
    }    
}));*/