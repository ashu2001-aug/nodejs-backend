const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../auth');
const cors = require('./cors');

const Dishes = require('../models/dishes');

const dishRouter = express.Router()
dishRouter.use(bodyParser.json())

dishRouter.route('/')       //Mount in index.js
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors,(req,res,next) => {
        Dishes.find({}) //After dB connectivity we will return JSON data back to client (for GET req). 
        .populate('comments.author')
        .then((dishes) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dishes); //get all
        }, (err) => next(err))  
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
        Dishes.create(req.body)
        .then((dish) => {
            console.log('Dish Created ', dish);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err))  
        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /dishes')   
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
        Dishes.remove({})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))  
        .catch((err) => next(err));
    });

/*
-
-
- dishId
-
-
*/

dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req,res,next) => {
        Dishes.findById(req.params.dishId) //Check if dish exists, if yes
        .populate('comments.author')
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);     //show the content
        }, (err) => next(err))  
        .catch((err) => next(err)); //catch if any error
    })
    .post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
        res.statusCode = 403
        res.end('POST operation not supported on /dishes/'+ req.params.dishId)  
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
        Dishes.findByIdAndUpdate(req.params.dishId, {
            $set: req.body  //find the dish and update body
        }, {
            new: true,
            useFindAndModify: false
        })
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err))  
        .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
        Dishes.findByIdAndRemove(req.params.dishId)
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end('Deleted dish'+ req.params.dishId);
            res.json(resp);
        }, (err) => next(err))  
        .catch((err) => next(err));
    });

/*
-
-
-  Route for dish.Comments
-
-
*/
dishRouter.route('/:dishId/comments')       //Mount in index.js
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req,res,next) => {
        Dishes.findById(req.params.dishId) //Search for a dish
        .populate('comments.author')
        .then((dish) => {
            if (dish != null) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments);
            }
            else {
                var err = new Error('Dish '+ req.params.dishId + ' not found.');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))  
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        Dishes.findById(req.params.dishId) //Search for a dish
        .then((dish) => {
            if (dish != null) {
                req.body.author = req.user._id; 
    // req.user is added to the body when we verify user, 
    // we dont want to send author field seperately from client side
                dish.comments.push(req.body);   //push  new set of comments 
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author')    //populate author info
                    .then((dish) => {        
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    })
                }, (err) => next(err))
            }
            else {
                var err = new Error('Dish '+ req.params.dishId + ' not found.');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))  
        .catch((err) => next(err));
        
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403
        res.end('PUT operation not supported on /dishes/'
        + req.params.dishId + '/comments')   
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null) {
                for (var i = (dish.comments.length -1); i >= 0; i--) {  //for each dish present
                    dish.comments.id(dish.comments[i]._id).remove();    //remove each comment
                }
                dish.save()
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                }, (err) => next(err))
            }
            else {
                var err = new Error('Dish '+ req.params.dishId + ' not found.');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))  
        .catch((err) => next(err));
    });

/*
-
-
- commentsId
-
-
*/

dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req,res,next) => {
        Dishes.findById(req.params.dishId)  //find a document called dish
        .populate('comments.author')
        .then((dish) => {
            var comId = dish.comments.id(req.params.commentId);
            if (dish != null && comId != null) { //check if dish & comment both are present
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comId);
            }
            else if (comId == null) {
                var err = new Error('Comment '+ req.params.commentId + ' not found.');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Dish '+ req.params.dishId + ' not found.');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))  
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        res.statusCode = 403
        res.end('POST operation not supported on /dishes/'+ req.params.dishId + 
        '/comments/' + req.params.commentId)  
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            var comId = dish.comments.id(req.params.commentId);
            if (dish != null && comId != null) {
                if(comId.author.toString() != req.user._id.toString()){ 
                    //This check is for verifying if the user performimg the action is indeed the author
                    err = new Error('You are not authorized to edit this comment');
                    err.status = 403;
                    return next(err);
                }
                if(req.body.rating){
                    comId.rating = req.body.rating
                }
                if(req.body.comment){
                    comId.comment = req.body.comment
                }
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author') //populate author info 
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    })
                }, (err) => next(err))
            }
            else if (comId == null) {
                var err = new Error('Comment '+ req.params.commentId + ' not found.');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Dish '+ req.params.dishId + ' not found.');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))   
        .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            var comId = dish.comments.id(req.params.commentId);
            if (dish != null && comId != null) {
                if(comId.author.toString() != req.user._id.toString()){
                    //This check is for verifying if the user performimg the action is indeed the author
                    err = new Error('You are not authorized to delete this comment');
                    err.status = 403;
                    return next(err);
                }
                comId.remove();    //remove comment
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author') //populate author info 
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    })
                }, (err) => next(err))
            }
            else if (comId == null) {
                var err = new Error('Comment '+ req.params.commentId + ' not found.');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Dish '+ req.params.dishId + ' not found.');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))   
        .catch((err) => next(err));
    });


module.exports = dishRouter;