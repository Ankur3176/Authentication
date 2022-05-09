require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

// const bcrypt = require("bcrypt"); we will use hashing and salting with passport now.
// const rounds= 10;

const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));

app.use(session({
    secret: "our little secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/User");

const userschema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
});

userschema.plugin(passportLocalMongoose);
userschema.plugin(findOrCreate);

const user = mongoose.model("user",userschema);

passport.use(user.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id); 
});

passport.deserializeUser(function(id, done) {
    user.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    user.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/",function(req,res){
    res.render("home");
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ['profile'] }));

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  });


app.get("/register",function(req,res){
    res.render("register");
});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});

app.post("/register",function(req,res){
    user.register({username: req.body.username},req.body.password,function(err,user){
        if(err)
        {
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login",function(req,res){

    const newuser = new user({
        username: req.body.usernmae,
        password: req.body.password
    });

    req.login(newuser,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local",{ failureRedirect: '/login' }),function(req,res){
                res.redirect("/secrets");
            };
        }
    });

});






app.listen(3000,function(){
    console.log("server is up and running !");
});