import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';

if(!fs.existsSync('./public/uploads')) {
    fs.mkdirSync('./public/uploads');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        const filename = Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, filename);
    }
})
  
const upload = multer({ 
    storage: storage 
});

export default upload;