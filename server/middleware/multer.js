import multer from "multer";
import os from "os";
import path from "path";

// Store uploaded files temporarily
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, os.tmpdir());
  },

  filename: (req, file, callback) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname);

    callback(null, uniqueName);
  },
});

// Allow image files only
const fileFilter = (req, file, callback) => {
  if (file.mimetype?.startsWith("image/")) {
    return callback(null, true);
  }

  return callback(new Error("Only image files are allowed"));
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

export default upload;