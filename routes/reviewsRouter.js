const Router = require("express");
const reviewsController = require("../controllers/reviewsController.js");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware.js");

const router = new Router();

router.get("/", reviewsController.getAll);
router.get("/:id", reviewsController.getOne);
router.post("/", checkRoleMiddleware("ADMIN"), reviewsController.create);

module.exports = router;
