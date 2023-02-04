const Router = require('express');

const productsRouter = require('./productRouter.js');
const articlesRouter = require('./articlesRouter.js');
const reviewsRouter = require('./reviewsRouter.js');
const userRouter = require('./userRouter.js');
const galleryRouter = require('./galleryRouter.js');
const messageRouter = require('./messageRouter.js');

const router = new Router();

router.use('/send-message', messageRouter);

router.use('/products', productsRouter);
router.use('/articles', articlesRouter);
router.use('/reviews', reviewsRouter);
router.use('/gallery', galleryRouter);
router.use('/user', userRouter);

module.exports = router;
