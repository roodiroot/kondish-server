const Router = require("express");

const productController = require("../controllers/productsController.js");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware.js");

const router = new Router();

router.get("/", productController.getAll);
router.get("/:id", productController.getOne);
router.post("/", checkRoleMiddleware("ADMIN"), productController.create);
router.put("/", checkRoleMiddleware("ADMIN"), productController.update);
router.delete("/", checkRoleMiddleware("ADMIN"), productController.delete);

module.exports = router;
