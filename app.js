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
const _ = require("lodash")
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

app.get("/checkOut", function (req, res) {
  res.render("checkOut");
});
app.get("/addProduct", function (req, res) {
    console.log("user: ", req.user);
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
    let currentUser = `${req.user._id}`.split('"')[0];
    console.log(currentUser);

    User.findOne({_id:currentUser}, function(err, user){
        if(err){
          console.log("Something is wrong...");
          console.log(err)
        }else{
            console.log("Current user is : ");
            console.log(user);
          res.render("myProfile", {user});
    
        }
      });

    // res.render("myProfile");

  }else{
      res.render("login");
  }
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
    extensions = [];
    randomNumber = Math.floor(Math.random() * 1000000 + 1);
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
    randomNumber = Math.floor(Math.random() * 1000000 + 1);
    console.log("Logged out....");
    req.logout();
    res.redirect("/");
});

//add product to database
const productSchema = new mongoose.Schema({
  productName: String,
  productCategory: String,
  productPrice: String,
  productDescription: String,
  owner: String,
  ownerName: String,
  status: String,
  productImages: [{
    productImage1: String,
    productImage2: String,
    productImage3: String,
    productImage4: String,
  }]
});
const Product = new mongoose.model("Product", productSchema);


var uploadMultipleProducts = upload.fields([
  { name: "productImage1", maxCount: 10 },
  { name: "productImage2", maxCount: 10 },
  { name: "productImage3", maxCount: 10 },
  { name: "productImage4", maxCount: 10 }
]);

app.post("/addProduct",
  uploadMultipleProducts,
  function(req, res){
    console.log("request: ", req);
    console.log("request body: ", req.body);
    console.log("request files: ", req.files);

  let currentUser = `${req.user._id}`.split('"')[0];
  console.log(currentUser);
  // randomNumber = Math.floor(Math.random() * 1000000 + 1)

  const newProduct = new Product({
    productName: req.body.productName,
    productCategory: req.body.productCategory,
    productPrice: req.body.productPrice,
    productDescription: req.body.productDescription,
    owner: currentUser,
    ownerName: `${req.user.fullName}`,
    status: "Available",
    productImages: [{
      productImage1: `productImage1${randomNumber}${extensions[0]}`,
      productImage2: `productImage2${randomNumber}${extensions[1]}`,
      productImage3: `productImage3${randomNumber}${extensions[2]}`,
      productImage4: `productImage4${randomNumber}${extensions[3]}`
    }]
  });

  newProduct.save(function(err){
    if(!err){
      randomNumber = Math.floor(Math.random() * 1000000 + 1);
      extensions = [];
      console.log("Product addedd successfully...");
      res.redirect("/allProducts");
    }else{
      console.log("Failed to add product to DB...");
      console.log(err);
    }
  });


});

app.get("/allProducts", function (req, res) {
  // res.render("allProducts");
  console.log(req.user);
  if (req.isAuthenticated()) {

    let products = [];
    Product.find({}, function(err, allProducts){
      if(err){
        console.log(err);
      }else{
        products = allProducts;
        res.render("allProducts", {products: products});
      }
  
    });
    console.log(products)

  } else {
    res.render("login");
  }
});


app.get("/product/:productId", function (req, res) {
  // res.render("product");
  
  if(req.isAuthenticated()){
    let requestedProductId = req.params.productId;
    console.log(requestedProductId);

    Product.findOne({_id:requestedProductId}, function(err, product){
        if(err){
          console.log("Something is wrong...");
          console.log(err)
        }else{
            console.log("Selected product is : ");
            console.log(product);
          res.render("product", {product});
    
        }
      });

  }else{
      res.render("login");
  }
});

app.post("/checkOut", function(req, res){
  if(req.isAuthenticated()){

    let days = req.body.days;
    let currentProduct = req.body.currentProduct;
    console.log(days, currentProduct);

    // let currentUser = `${req.user._id}`.split('"')[0];
    // console.log(currentUser);

    // var u = "";

    // User.findOne({_id:currentUser}, function(err, user){
    //     if(err){
    //       console.log("Something is wrong...");
    //       console.log(err)
    //     }else{
    //         console.log("Current user is : ");
    //         console.log(user);
    //         u = user;
    //     }
    // });

    var p = "";
    Product.findOne({_id:currentProduct}, function(err, product){
      if(err){
        console.log("Something is wrong...");
        console.log(err)
      }else{
          console.log("Selected product is : ");
          console.log(product);
          product.productPrice = +(+product.productPrice)*(+days); 
          product.securityDeposit = +(product.productPrice/2);
          product.total = (+product.productPrice + +product.securityDeposit);
          res.render("checkOut", {product});
      }
    });

  }else{
    res.render("login");
  }
})



// product.productPrice = +(+product.productPrice)*(+days); 
// product.securityDeposit = product.productPrice/2;
// product.total = (product.productPrice + product.securityDeposit);
// p = product;