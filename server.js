/*
    Name : An Vo
    Project : Homework 3
    Description : Web API salfolding for Movie API
 */

    var express = require('express');
    var http = require('http');
    var bodyParser = require('body-parser');
    var passport = require('passport');
    var authJwtController = require('./auth_jwt');
    var jwt = require('jsonwebtoken');
    var cors = require('cors');
    var User = require('./Users');
    var Movie = require('./Movies');
    var Review = require('./Reviews');
    var Foods = require('./Food');
    
    var app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(passport.initialize());
    var router = express.Router();
    
    router.post('/signup', function(req, res) {
        // checks if the fields are empty
        if (!req.body.username || !req.body.password) {
            res.json({success: false, msg: 'Please include both username and password to signup.'})
            //if they arent create a user
        }else {
            var user = new User()
            user.name = req.body.name
            user.username = req.body.username
            user.password = req.body.password
    
            // we save the user and if run into an error then we put the error out
            user.save(function(err){
                if (err) {
                    if (err.code === 11000) return res.json({success: false, message: 'A user with that username already exist'})
                    else
                        return res.json(err)
                }
                // otherwise send a happy note
                console.log("created new user")
                return res.status(200).json({success: true, message: "Successfully created new user."});
            })
        }
    });
    router.post('/signin', function (req, res) {
        var userNew = new User();
        userNew.username = req.body.username;
        userNew.password = req.body.password;
    
        User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
            if (err) {
                res.send(err);
            }
    
            user.comparePassword(userNew.password, function(isMatch) {
                if (isMatch) {
                    var userToken = { id: user.id, username: user.username };
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);
                    res.json ({success: true, token: 'JWT ' + token});
                }
                else {
                    res.status(401).send({success: false, msg: 'Authentication failed.'});
                }
            })
        })
    });
    
    router.route('/menu')
        .post(authJwtController.isAuthenticated, function(req,res){            // create new food item
            var food = new Foods()
            food.name = req.body.name
            food.imageUrl = req.body.imageUrl
            food.cost = req.body.cost
            food.calories = req.body.calories

            if(req.body.name === "" ||  req.body.cost === "" || req.body.calories === ""){
                return res.json({success: false, message: "Not all fields were filled out"})
            }
            food.save(function(err){
                if (err) {
                    if (err.code === 11000){
                        return res.json({success: false, message: "This movie already exist"})
                    } else { throw err }
                }
                return res.status(200).json({success: true, message: "Successfully added new movie"})
            })
        })
    
    
        router.route('/reviews')
        .post(authJwtController.isAuthenticated, function(req,res){            // create new movie
            Movie.findOne({title: req.body.titleOfMovie}).select('title').exec(function(err,movie){
                if (err) {
                    return res.json({message: "There was an error", error: err})
                } 
                if (movie != null) {
                    if (err){
                       throw err
                    }
                    let review = new Review()
                    review.nameOfReviewer = req.body.name;
                    review.comment = req.body.comment
                    review.rating = req.body.rating
                    movie.avgRating.push(req.body.rating)
                    review.titleOfMovie = req.body.titleOfMovie
                    review.movieID = movie.id
                    review.save(function(err){
                        if(err){
                            return res.json({success: false, msg: "could not post review"})
                        }
                        return res.json({success: true, msg: "Review added"})
                    })
                } else{
                    return res.json({message: "Movie was not found", error: err})
                }
            })
        })
    
    
    
    
    app.use('/', router);
    app.listen(process.env.PORT || 8080);
    module.exports = app; // for testing only