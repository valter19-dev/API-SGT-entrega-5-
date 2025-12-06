import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(16).toString("hex");
    const filename = `${hash}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

export default upload;
