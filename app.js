const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
    res.render("index");
})
app.get("/allProducts", function(req, res){
    res.render("allProducts");
})
app.get("/about", function(req, res){
    res.render("about");
})
app.get("/contact", function(req, res){
    res.render("contact");
})
app.get("/login", function(req, res){
    res.render("login");
})
app.get("/register", function(req, res){
    res.render("register");
})
app.get("/product", function(req, res){
    res.render("product");
})
app.get("/checkOut", function(req, res){
    res.render("checkOut");
})
app.get("/addProduct", function(req, res){
    res.render("addProduct");
})
app.get("/myProducts", function(req, res){
    res.render("myProducts");
})
app.get("/myProfile", function(req, res){
    res.render("myProfile");
})

app.listen(3333, function(){
    console.log("server started at http://localhost:3333");
})