const express = require('express');
const bodyParser = require('body-parser');


const leaderRouter = express.Router();


leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get(async (req, res, next) => {
        try {
            let leaders = await Leaders.find({})
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leaders);
        } catch (e) {
            next(e);
        }
    })
    .post(async (req, res, next) => {
        try {
            let leader = await Leaders.create(req.body);
            console.log('Leader Created ', leader);
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
        } catch (e) {
            next(e);
        }

    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /leaders');
    })
    .delete(async (req, res, next) => {
        try {
            let resp = await Leaders.remove({})
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        } catch (e) {
            next(e);
        }
    });

///leaders/:leaderId
leaderRouter.route('/:leaderId')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get(async (req, res, next) => {
        try {
            let leader = await Leaders.findById(req.params.leaderId)
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
        }catch (e) {
            next(e);
        }
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /leaders/' + req.params.leaderId);
    })
    .put(async (req, res, next) => {
        try {
            let leader = await Leaders.findByIdAndUpdate(req.params.leaderId, {
                $set: req.body
            }, {new: true});
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
        }catch (e) {
            next(e);
        }
    })
    .delete(async (req, res, next) => {
        try {
            let resp = await Leaders.findByIdAndRemove(req.params.leaderId);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }catch (e){
            next(e)
        }
    })

module.exports = leaderRouter;