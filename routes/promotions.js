const express = require('express');
const bodyParser = require('body-parser');


const promosRouter = express.Router();


promosRouter.use(bodyParser.json());

promosRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get(async (req, res, next) => {
        try {
            let promotions = await Promotions.find({})
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotions);
        } catch (e) {
            next(e);
        }
    })
    .post(async (req, res, next) => {
        try {
            let promotion = await Promotions.create(req.body);
            console.log('Promotion Created ', promotion);
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        } catch (e) {
            next(e);
        }
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete(async (req, res, next) => {
        try {
            let resp = await Promotions.remove({})
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        } catch (e) {
            next(e);
        }
    });
//  /promotions/:promotionId
promosRouter.route('/:promoId')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get(async (req, res, next) => {
        try {
            let promotion = await Promotions.findById(req.params.promoId)
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        } catch (e) {
            next(e);
        }
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /promotions/' + req.params.promoId);
    })
    .put(async (req, res, next) => {
        try {
            let promotion = await Promotions.findByIdAndUpdate(req.params.promoId, {
                $set: req.body
            }, {new: true});
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        } catch (e) {
            next(e);
        }
    })
    .delete(async (req, res, next) => {
        try {
            let resp = await Promotions.findByIdAndRemove(req.params.promoId);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        } catch (e) {
            next(e)
        }
    })

module.exports = promosRouter;