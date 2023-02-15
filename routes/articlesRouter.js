const Router = require("express");

const articlesController = require("../controllers/articlesController.js");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware.js");

const router = new Router();

router.get("/", articlesController.getAll);
router.get("/:id", articlesController.getOne);
router.post("/", checkRoleMiddleware("ADMIN"), articlesController.create);
router.delete("/", checkRoleMiddleware("ADMIN"), articlesController.delete);

module.exports = router;
