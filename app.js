const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const usermodel = require("./models/user");
const postmodel = require("./models/post");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const requestModel = require("./models/request")

const path = require('path');
const user = require('./models/user');
// const { log } = require('console');
// const user = require('./models/user');
// const { deepEqual } = require('assert');
// const post = require('./models/post');
// const user = require('./models/user');
// const post = require('./models/post');
app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

// Home page route
app.get('/',(req,res)=>{
    res.render('frontend');
})

// Registration form route
app.get('/index',(req,res)=>{
    res.render('index')
})

// Create User
app.post('/create',async (req,res)=>{
    let {username,email,password,age} = req.body;
    let user = await usermodel.findOne({email});
    if (user) {
        return res.status(500).send("user already registered")
    }
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt, async (err,hash)=>{
            let createduser = await usermodel.create({
                username,
                email,
                password:hash,
                age
            })
            let token = jwt.sign({email:email},"shh");
            res.cookie("token",token);
            //res.send(createduser);
            res.render('login2');
            
        })
    })
});

// Successful message
app.get("/success",function(req,res){
    res.redirect("success");
});

// logout route
app.get("/logout",function(req,res){
    res.cookie("token","");
    res.redirect("/");
});

// login route
app.get("/login",function(req,res){
    res.render('login');
});

// After registration home page
app.get("/login2",function(req,res){
    res.render('login2');
});

app.get("/profile",isloggedIn , async (req,res)=>{
    let user = await usermodel.findOne({email: req.user.email})
    res.render("profile", {user});
    console.log(user);
    
})

// Login function
app.post("/login", async function(req,res){
    let {email , password} = req.body;
     let user = await usermodel.findOne({email: req.body.email});
     if(!user) return res.send("something is wrong");
     bcrypt.compare(req.body.password , user.password,function(err,result){    
        if(result){
            let token = jwt.sign({email:email,userid: user._id},"shh");
            res.cookie("token",token);
             res.redirect('/login2');
            // res.send("yes u can login");
            // res.redirect("/profile");
        }
        else {
            res.send("you cant login");
        }
    })
});

// Request food
// app.post('/Donate', async (req, res) => {
//     try {
//         const { pname, paddress, pcontact, pquantity, food_type, img } = req.body;

//         console.log("Form Data Received:", req.body); // Debugging step

//         // Save new post to the database
//         const createdPost = await postmodel.create({
//             pname,
//             paddress,
//             pcontact,
//             pquantity,
//             food_type,
//             img
//         });

//         // console.log("Created Post:", createdPost); // Debugging step

//         // Retrieve all posts for display
//         const allposts = await postmodel.find();
//         // res.send("done");

//         // res.render("Userdisplay", { posts: createdPost });
//     } catch (error) {
//         console.error("Error in /Donate route:", error); // Debugging step
//         res.status(500).send("Error creating or fetching posts.");
//     }
// });

app.post("/Userdisplay", isloggedIn, async (req, res) => {
    let user = await usermodel.findOne({email: req.user.email});
    let {pname,
        pcontact,
        pquantity,
        paddress,
        food_type,
        imgl} = req.body;
        
        let post = await postmodel.create({
            user: user._id,
        pname,
        pcontact,
        pquantity,
        paddress,
        food_type,
        imgl
    })
    
    user.posts.push(post._id);
    await user.save();
    res.redirect("/Userdisplay")
})

app.get('/Userdisplay', isloggedIn, async (req,res)=>{
    let user = await usermodel.findOne({email: req.user.email}).populate("posts")
    // const allposts = await postmodel.find();
    res.render("Userdisplay", {user});
})


// delete function
app.get('/delete/:id', async (req, res) => {
    try {
        const result = await postmodel.findByIdAndDelete(req.params.id);
        const allposts = await postmodel.find(); // Fetch updated posts after deletion

        res.redirect("/Userdisplay");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Request food page dashboard
app.get('/display', async (req, res) => {
    try {
        const selectedType = req.query.food_type || "";

        // Build filter object dynamically
        let filter = {};
        if (selectedType !== "") {
            filter.food_type = selectedType;
        }

        const posts = await postmodel.find(filter);

        res.render("display", {
            posts: posts,
            selectedType: selectedType  // so the correct <option> is selected in EJS
        });

    } catch (error) {
        res.status(500).send("Server Error: " + error.message);
    }
});

// Order now
app.get('/order/:postid', isloggedIn, async (req, res) => {
    const post = await postmodel.findById(req.params.postid).populate("user");
    res.render("orderpage", {post});
})
app.post('/order/:postid', isloggedIn, async (req, res) => {
    await requestModel.create({
        post: req.params.postid,
        requestedBy: req.user.userid
    });
    res.send("Request submitted!");
});
app.get('/requests', isloggedIn, async (req, res) => {
    const user = await usermodel.findOne({ email: req.user.email });

    const requests = await requestModel.find()
        .populate('post')
        .populate('requestedBy')
        .where('post.user').equals(user._id);

    res.render("requestsPage", { requests });
});
app.post('/requests/:id/approve', isloggedIn, async (req, res) => {
    await requestModel.findByIdAndUpdate(req.params.id, { status: "approved" });
    res.redirect('/myRequests');
});

app.post('/requests/:id/reject', isloggedIn, async (req, res) => {
    await requestModel.findByIdAndUpdate(req.params.id, { status: "rejected" });
    res.redirect('/myRequests');
});
app.get('/myrequests', isloggedIn, async (req, res) => {
    const requests = await requestModel.find({ requestedBy: req.user.userid }).populate("post");
    res.render("myRequests", { requests });
});

function isloggedIn(req,res,next){
    console.log(req.cookies.token==="");
    if(req.cookies.token==="")res.redirect("/login");
    else{
        let data = jwt.verify(req.cookies.token,"shh");
        req.user = data;
    }
    next();
} 

app.listen(3000);