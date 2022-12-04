const multer = require('multer');

module.exports = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            
            if (file.fieldname === "enderecoSinal") {
                console.log("Estou recebendo isso: " + file.mimetype + "  " + file.originalname)
                if(file.mimetype === "image/gif"){
                    cb(null, './public/upload/sinais');    
                }else{
                    cb(null, './public/upload/videosBrutos');
                }
                
            } else {
                cb(null, './public/upload/imgAssociativa');
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