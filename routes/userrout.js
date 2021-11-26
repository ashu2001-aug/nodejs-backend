var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
const passport = require('passport');
var authenticate = require('../auth');

var userRouter = express.Router();
userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
  .then((users) => {
    res.statusCode = 200;
    res.setHeader('Content_type', 'application/json');
    res.json(users); 
  }, (err) => next(err))
  .catch((err) => next(err));
});

userRouter.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, 
  (err, user) => { 
    if (err) {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json({err: err});
    }
    else { 
      if (req.body.firstname) {
        user.firstname = req.body.firstname
      }
      if (req.body.lastname) {
        user.lastname = req.body.lastname
      }
      user.save((err, user) => {
        if (err) {
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          res.json({err: err});
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json')
          res.json({success: true, status: "Registration Successful!"});
        });
      });
    }
  });
});

userRouter.post('/login', passport.authenticate('local'), //error will be handled by authenticate function
  (req, res) => {

    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json')
    res.json({success: true, token: token,
      status: "You are successfully logged-in!"});
});

userRouter.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id'); // to avoid user access using timed out session
    res.redirect('/');
  }
  else {
    var err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
})
userRouter.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

module.exports = userRouter;