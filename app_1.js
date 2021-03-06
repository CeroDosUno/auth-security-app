//jshint esversion:6
//code used for hashing and salting before I implemented cookies and sessions.
require('dotenv').config();

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const md5 = require('md5');
const bcrypt = require('bcrypt');
const passport = require('passport');
const passportLocal = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const expressSession = require('express-session');


const app = express();


const saltRounds = 10;

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));

mongoose.connect("mongodb://localhost:27017/userDB",{
  useNewUrlParser:true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const secret = process.env.SECRET;


const User = mongoose.model("User",userSchema);

app.get('/',function(req,res){
  res.render("home");
});

app.get('/login',function(req,res){
  res.render("login");
});

app.get('/register',function(req,res){
  res.render("register");
});



app.post('/register',function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        console.log("User exists.");
        res.render("home");
      }else{
        bcrypt.hash(password, saltRounds, function(err, hash){

          const newUser = new User({
            email: username,
            password: hash
          });

          newUser.save(function(err){
            if(err){
              console.log(err);
            } else{
              res.render("secrets");
            }
          });
        });
      }
    }
  });

});


app.post('/login',function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        bcrypt.compare(password,foundUser.password,function(err,result){
          if(result === true){
            res.render("secrets");
          }
        });
      } else{
        console.log("User not found.");
        res.render("home");
      }
    }
  });
});









app.listen(3000,function(){
  console.log("Server started on port 3000");
})
