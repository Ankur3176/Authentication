require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const rounds= 10;

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

    bcrypt.hash(req.body.password,rounds,function(err,hash){
        if(!err)
        {
            
            const userdata = new user({
                email: req.body.username,
                password: hash
            });
            
            userdata.save(function(err){
                if(err){
                    console.log(err);
                }
                else{
                    res.render("secrets");     
                }
            
            });
            
        }
        else{
            console.log(err);
        }
    })
});

app.post("/login",function(req,res){
    const name = req.body.username;
    const pass = req.body.password;
    
    user.findOne({email: name},function(err,founduser){
        if(founduser)
        {

            bcrypt.compare(pass,founduser.password,function(err,result){
                if(result===true){
                    res.render("secrets");
                }
            })
        }
        if(err){
            console.log(err);
        }
    });
});






app.listen(3000,function(){
    console.log("server is up and running !");
});