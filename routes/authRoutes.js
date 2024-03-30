const {
  signup,
  verifyAccount,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const multer = require("multer");
const verifyUser = require("../middlewares/verifyUser");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = require("express").Router();

router.post("/signup", upload.single("image"), signup);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.get("/verifyAccount/:token", verifyAccount);

module.exports = router;
