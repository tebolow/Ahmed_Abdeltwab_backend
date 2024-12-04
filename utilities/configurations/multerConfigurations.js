const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        // let ext = file.mimetype.split("/")[1];
        let name = Date.now() + "-" + Math.round(Math.random() * 100000) + file.originalname;
        cb(null, name);
    },
});

const upload = multer({ storage: storage });
module.exports = upload;
