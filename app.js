const express = require("express")
// const bodyParser = require("body-parser")
const ejs = require("ejs")
const app = express();
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const multer  = require('multer')
// const upload = multer({ dest: '../uploads/' })
// const findOrCreate = require('mongoose-findorcreate');

app.set('view engine', 'ejs');
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());


// app.use(bodyParser.urlencoded({
//     extended: true
//   }));

// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static(__dirname+"uploads"));

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

//mongoose

mongoose.connect("mongodb://127.0.0.1:27017/rentIt", {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    console.log("Connection successfull....")
})
.catch((err)=>{
    console.log(err)
});

const userSchema = new mongoose.Schema({
    fullName: String,
    phoneNumber: String,
    email: String,
    collegeId: String,
    password: String,
    confirmPassword: String,
    idImage: String
});

const User = new mongoose.model("User", userSchema);

//register user
let newName;
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "uploads");
    },
    filename: (req, file, cb)=>{
        console.log(file);
        newName = Date.now() + path.extname(file.originalname);
        cb(null, newName);
    }
})

const upload = multer({storage: storage});

app.post("/register", upload.single("IdCardImage"), (req, res)=>{

    //creating User instance
    const user = new User({
        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.emailAddress,
        collegeId: req.body.collegeId,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        idImage: newName
        // profileImage: req.body.ProfileImage,
    });
    user.save()
    .then(()=>{
        console.log("Uploaded successfully...");
        res.redirect("/login")
    })
    .catch(err=>console.log("Failed...."));

});

// const user = new User({
    //     fullName: req.body.fullName,
    //     phoneNumber: req.body.phoneNumber,
    //     email: req.body.emailAddress,
    //     collegeId: req.body.collegeId,
    //     password: req.body.password,
    //     confirmPassword: req.body.confirmPassword,
    //     idImage: req.body.IdCardImage,
    //     profileImage: req.body.ProfileImage,
    //     // idImage:{
    //     //     // data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.body.IdCardImage)),
    //     //     data: fs.readFileSync(`${__dirname}\\uploads\\${req.body.IdCardImage}`),
	// 	// 	contentType: 'image/png'
    //     // },
    //     // profileImage:{
    //     //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.body.ProfileImage)),
    //     //     contentType: 'image/png'
    //     // },
    // })

	// User.create(user, (err, item) => {
	// 	if (err) {
	// 		console.log("Something is wrong....");
	// 		console.log(err);
	// 	}
	// 	else {
    //         console.log("Thank God....");
	// 		res.redirect('/');
	// 	}
	// });

// var obj = {
	// 	name: req.body.name,
	// 	desc: req.body.desc,
	// 	img: {
	// 		data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
	// 		contentType: 'image/png'
	// 	}
	// }