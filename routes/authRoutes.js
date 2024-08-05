const {
  signup,
  verifyAccount,
  login,
  forgotPassword,
  resetPassword,
  registerDriver,
  driverInfo,
  verifyToken,
} = require("../controllers/authController");
const verifyUser = require("../middlewares/verifyUser");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = require("express").Router();

router.post("/signup", upload.single("image"), signup);
router.post("/registerDriver", registerDriver);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.get("/verifyAccount/:token", verifyAccount);
router.get("/driverInfo/:driverId/:userId", driverInfo);
router.get("/verifyToken", verifyToken);

module.exports = router;
