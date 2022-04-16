require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/User");

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));

const userschema = new mongoose.Schema({
    email: String,
    password: String 
});

const user = mongoose.model("user",userschema);

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
const userdata = new user({
    email: req.body.username,
    password: md5(req.body.password)
});

userdata.save(function(err){
    if(err){
        console.log(err);
    }
    else{
        res.render("secrets");     
    }

});
});

app.post("/login",function(req,res){
    const name = req.body.username;
    const pass = md5(req.body.password); 
    user.findOne({email: name},function(err,founduser){
        if(founduser)
        {
            if(founduser.password===pass)
            {
                res.render("secrets");
            }
            else{
                res.redirect("/login");
            }
        }
        if(err){
            console.log(err);
        }
    });
});






app.listen(3000,function(){
    console.log("server is up and running !");
});