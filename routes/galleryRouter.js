const Router = require("express");

const galleryController = require("../controllers/galleryController.js");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware.js");

const router = new Router();

router.get("/", galleryController.getAll);
router.post("/", checkRoleMiddleware("ADMIN"), galleryController.create);

module.exports = router;
