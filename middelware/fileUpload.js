import multer from "multer";
import path from "path";

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // console.log(file);
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

export var upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    // console.log(file);
    if (
      file.mimetype == "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"
    ) {
      callback(null, true);
    } else {
      console.log("only jpg & png file supports");
      callback(null, false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     let ext = path.extname(file.originalname);
//     cb(null, Date.now() + ext);
//   },
// });

// const fileFilter = function (req, file, cb) {
//   const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only jpg and png files are supported"), false);
//   }
// };

// export const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
// });
