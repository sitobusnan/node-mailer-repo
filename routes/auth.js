const express = require("express");
const passport = require('passport');
const router = express.Router();
const User = require("../models/User");

// import mail text
const mailText = require('../templates/mailText')

// NodeMailer import
const transporter = require('../configs/modemailer.config')

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


router.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/auth/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  if (username === "" || password === "" || email === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);
    const characters ="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let token = "";
    for (let i = 0; i < 25; i++) {
      token += characters[Math.floor(Math.random() * characters.length)];
    }
  

    const newUser = new User({
      username,
      password: hashPass,
      confirmationCode: token,
      email:email
    });

    newUser.save()
    .then(() => {
      transporter.sendMail({
        from: '"SITO 🤪" <sito.ironhack@gmail.com>',
        to: email, 
        subject: "Confirmation mail", 
        text: "Confirm",
        html: mailText(token)
      })
      .then(info => console.log(info))
      .catch(error => console.log(error));
    
      res.redirect("/");
    })
    .catch(err => {
      console.log(err)
      res.render("auth/signup", { message: "Something went wrong" });
    })
  });
});

router.get("/confirm/:confirmCode", (req, res) => {
  User.findOneAndUpdate({confirmationCode:req.params.confirmCode},{$set:{active:true}},{new: true})
  .then((user)=>{
    res.render("auth/activation",{user})
  }).catch(()=>{
    console.log("A ocurrido un error de activacion")
  })  
})


router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
