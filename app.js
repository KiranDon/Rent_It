const express = require("express");
// const bodyParser = require("body-parser")
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
// const upload = multer({ dest: '../uploads/' })
// const findOrCreate = require('mongoose-findorcreate');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

// app.use(bodyParser.urlencoded({
//     extended: true
//   }));

// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static(__dirname + "uploads"));
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (req, res) {
  res.render("index");
});
app.get("/allProducts", function (req, res) {
  // res.render("allProducts");
  console.log(req.user);
  if (req.isAuthenticated()) {
    res.render("allProducts");
  } else {
    res.render("login");
  }
});
app.get("/about", function (req, res) {
  res.render("about");
});
app.get("/contact", function (req, res) {
  res.render("contact");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/product", function (req, res) {
  res.render("product");
});
app.get("/checkOut", function (req, res) {
  res.render("checkOut");
});
app.get("/addProduct", function (req, res) {
    console.log(req.user);
  if (req.isAuthenticated()) {
    res.render("addProduct");
  } else {
    res.render("login");
  }
  // res.render("addProduct");
});
app.get("/myProducts", function (req, res) {
  res.render("myProducts");
});
app.get("/myProfile", function (req, res) {
    console.log(req.user);
  if(req.isAuthenticated()){
      res.render("myProfile");
  }else{
      res.render("login");
  }
//   res.render("myProfile");
});

app.listen(3333, function () {
  console.log("server started at http://localhost:3333");
});

//mongoose

mongoose
  .connect("mongodb://127.0.0.1:27017/rentIt", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection successfull....");
  })
  .catch((err) => {
    console.log(err);
  });
// mongoose.set("useCreateIndex", true); //no need anta

const userSchema = new mongoose.Schema({
  username: String,
  fullName: String,
  phoneNumber: String,
  email: String,
  collegeId: String,
  password: String,
  idImage: String,
  profileImage: String,
});
// userSchema.plugin(passportLocalMongoose);
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

//register user
let randomNumber = Math.floor(Math.random() * 1000000 + 1);
let newName;
let extensions = [];
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    newName = file.fieldname + randomNumber + path.extname(file.originalname);
    extensions.push(path.extname(file.originalname));
    cb(null, newName);
  },
});

var upload = multer({ storage: storage });

var uploadMultiple = upload.fields([
  { name: "IdCardImage", maxCount: 10 },
  { name: "ProfileImage", maxCount: 10 },
]);

app.post(
  "/register",
  uploadMultiple,
  function (req, res, next) {
    console.log(req.body);
    const user = new User({
      username: req.body.username,
      fullName: req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      email: req.body.username,
      collegeId: req.body.collegeId,
      password: req.body.password,
      idImage: `IdCardImage${randomNumber}${extensions[0]}`,
      profileImage: `ProfileImage${randomNumber}${extensions[1]}`,
    });
    User.register(user, req.body.password, function (err, user) {
      if (err) {
        console.log(err);
        console.log("error")
        return res.redirect("/register");
      }
      next();
    });
  },
  passport.authenticate("local", {
    successRedirect: "/allProducts",
    failureRedirect: "/register",
  })
);



//login user
app.post("/login", function (req, res) {
  console.log(req.body);
  const user = new User({
      username: req.body.username,
      password: req.body.password
  });

  req.login(user, function(err){
      if(err){
          console.log("Login Failed....");
          console.log(err);
          return res.redirect("/login");
      }else{
          passport.authenticate("local")(req, res, function(){
              console.log("Login Success...");
              res.redirect("/allProducts");
          });
      }
  })
});

//logout user
app.get("/logout", function (req, res) {
    console.log("Logged out....");
    req.logout();
    res.redirect("/");
});