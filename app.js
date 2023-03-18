
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const ejs = require("ejs");
const fs = require('fs');
const multer = require('multer');
const { htmlToText } = require("html-to-text");
const mongoose = require('mongoose');
const _ = require('lodash');


const sharp = require('sharp');
const { result } = require("lodash");
const { title } = require("process");

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRETS,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');


//----------------------------------mongoose operation-----------------------------------------------------
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI);

const blogSchema = new mongoose.Schema({
    title: String,
    category: String,
    imgSrc: String,
    cardContent: String,
    postContent: String,
    date: String,
    featured: String,
    comment: [{
        name: String,
        imageSrc: String,
        id: String,
        comment: String,
        likes: Number,
        reply: [{
            name: String,
            imageSrc: String,
            reply: String
        }]
    }]
});
const Post = mongoose.model('Post', blogSchema);

const userSchema = new mongoose.Schema({
    username: String,
    displayName: String,
    googleId: String,
    imageSrc: String,
    role: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

const postCountSchema = new mongoose.Schema({
    month: String,
    articleCount: Number
})
const PostCount = mongoose.model('PostCount', postCountSchema);


passport.use(User.createStrategy());

// Serialize the user ID into the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// Deserialize the user ID from the session and find the user by ID
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://the-world-tech-travel.onrender.com/auth/google/wtt"
},
    function (accessToken, refreshToken, profile, cb) {

        User.findOrCreate({ username: profile.emails[0].value, googleId: profile.id, displayName: profile.displayName, imageSrc: profile.photos[0].value }, function (err, user) {
            return cb(err, user);
        });
    }
));

// ------------------------------------------resgistering admin-------------




//---------------accesing image from local file and storing in publim->images folder

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }
});

app.get('/', function (req, res) {

    if (req.isAuthenticated()) {
        Post.find({ featured: "true" }).sort({ _id: -1 }).limit(6).exec().then((docs) => {
            res.render('home', { docs: docs, bannerImg: "home", style: "styles", login: "logout", imageSrc: req.user.imageSrc });
        }).catch((err) => {
            console.log(err);
        })

    } else {
        Post.find({ featured: "true" }).sort({ _id: -1 }).limit(6).exec().then((docs) => {
            res.render('home', { docs: docs, bannerImg: "home", style: "styles", login: "login", imageSrc: "https://the-world-tech-travel.onrender.com/images/avatar.jpg" });
        }).catch((err) => {
            console.log(err);
        })
    }
})
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', "email"] }));

app.get('/auth/google/wtt',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Clear the returnTo value from the session
        res.redirect('/');

    });
app.get('/admin', (req, res) => {

    res.render('admin');

})

app.get('/compose', function (req, res) {

    if (req.isAuthenticated() && req.user.role === "admin") {
        res.render('compose', { style: "styles" });
    }
    else {
        res.redirect('/login')
    }


})

app.get('/delete', (req, res) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
        Post.find().sort({ _id: -1 }).exec().then((result) => {

            res.render('delete', { docs: result, style: "styles", bannerImg: "home" })
        }).catch((err)=>{
            console.log(err);
        })
    }
    else {
        res.redirect('/login')
    }


})
app.get('/update', (req, res) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
        Post.find().sort({ _id: -1 }).exec().then((result) => {

            res.render('update', { docs: result, style: "styles", bannerImg: "home" })
        }).catch((err)=>{
            console.log(err);
        })
    }
    else {
        res.redirect('/login')
    }



})
app.get('/login', (req, res) => {

    res.render('login', { style: "styles", bannerImg: "home", login: "login", imageSrc: "https://the-world-tech-travel.onrender.com/images/avatar.jpg"});






})
app.get('/logout', (req, res) => {
    req.logOut((err) => {
        console.log(err);
    });
    res.redirect('/');
})



app.get('/:category', (req, res) => {

    topics = _.toLower(req.params.category);

    if (req.isAuthenticated()) {

        Post.find({ category: topics }).sort({ _id: -1 }).then((result) => {
            res.render('category', { docs: result, pageTitle: _.capitalize(req.params.category), bannerImg: topics, style: "styles", login: "logout", imageSrc: req.user.imageSrc });

        }).catch((err) => {
            console.log(err);
        })


    } else {


        Post.find({ category: topics }).sort({ _id: -1 }).then((result) => {


            res.render('category', { docs: result, pageTitle: _.capitalize(req.params.category), bannerImg: topics, style: "styles", login: "login", imageSrc:"https://the-world-tech-travel.onrender.com/images/avatar.jpg" });

        }).catch((err) => {
            console.log(err);
        })

    }




});

app.get('/:category/:postTitle', (req, res) => {

    const category = _.toLower(req.params.category);

    const id = req.params.postTitle;
    Post.findById(id, { comment: 1, _id: 0 }).then((commentRes) => {
        const commentTemp = fs.readFileSync('views/comment.ejs', 'utf-8');
        const compiledComment = ejs.compile(commentTemp);
        const commentData = { result: commentRes.comment, postId: id, categoryComment: category };
        const commentPost = compiledComment(commentData);

        if (req.isAuthenticated()) {

            // // res.render('nestedComments',{result:result.comment});

            Post.find().sort({ _id: -1 }).limit(3).exec().then((recent) => {
                // sending data to ejs without rendering for recent post card
                const template = fs.readFileSync('views/recentPost.ejs', 'utf8');
                const compiledTemplate = ejs.compile(template);
                const recentData = { docs: recent };
                const recentPost = compiledTemplate(recentData);

                //updating post
                if ((category === "featured")) {

                    Post.findById(id).then((result) => {
                        res.render('post', { title: _.capitalize(result.title), category: result.category, date: result.date, content: result.postContent, bannerImg: result.category, recentPost: recentPost, commentPost: commentPost, style: "styles", login: "logout", imageSrc: req.user.imageSrc });
                    }).catch((err)=>{
                        console.log(err);
                    })

                } else {
                    Post.findById(id).then((result) => {
                        res.render('post', { title: _.capitalize(result.title), category: result.category, date: result.date, content: result.postContent, bannerImg: category, recentPost: recentPost, commentPost: commentPost, style: "styles", login: "logout", imageSrc: req.user.imageSrc });
                    }).catch((err)=>{
                        console.log(err);
                    })
                }
            }).catch((err)=>{
                console.log(err);
            })


        } else {
            Post.find().sort({ _id: -1 }).limit(3).exec().then((result) => {
                // sending data to ejs without rendering for recent post card
                const template = fs.readFileSync('views/recentPost.ejs', 'utf8');
                const compiledTemplate = ejs.compile(template);
                const data = { docs: result };
                const recentPost = compiledTemplate(data);

                //updating post
                if ((category === "featured")) {


                    Post.findById(id).then((result) => {

                        res.render('post', { postId: id, title: _.capitalize(result.title), category: result.category, date: result.date, content: result.postContent, bannerImg: result.category, recentPost: recentPost, commentPost: commentPost, style: "styles", login: "login", imageSrc: "https://the-world-tech-travel.onrender.com/images/avatar.jpg" });
                    }).catch((err)=>{
                        console.log(err);
                    })

                } else {
                    Post.findById(id).then((result) => {
                        res.render('post', { postId: id, title: _.capitalize(result.title), category: result.category, date: result.date, content: result.postContent, bannerImg: category, recentPost: recentPost, commentPost: commentPost, style: "styles", login: "login", imageSrc:"https://the-world-tech-travel.onrender.com/images/avatar.jpg" });
                    }).catch((err)=>{
                        console.log(err);
                    })
                }
            }).catch((err)=>{
                console.log(err);
            })
        }
    }).catch((err)=>{
        console.log(err);
    })



});






// -----------------------------------------------------------post request-----------------------------------------------------
app.post('/submit-form', upload.single('image'), async (req, res) => {

    const filename = req.file.filename;
    const updateFilename = 'public/images/' + filename;
    const resizedFilename = 'public/images/resized-' + filename;
    sharp(updateFilename)
        .resize(
            {
                width: 550,
                height: 275,
            
            })

        .toFile(resizedFilename, (err) => {
            if (err)
                console.log(err);
            fs.unlink(updateFilename, function (err) {
                if (err) throw err;
                console.log('Original image deleted');
            });

        })


    const title = req.body.title;
    const category = _.lowerCase(req.body.category);
    const featured = req.body.featuredPost;
    console.log(featured);

    const imgSource = resizedFilename.substring(7, resizedFilename.length);
    console.log('/' + category);
    const content = req.body.content;
    const text = htmlToText(content, {
        wordwrap: 10
    })
    //getting timestamp
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const posstedDate = date.toLocaleString("en-GB", { month: "long", year: "numeric" });


    if (featured === "true") {
        const blogPost = new Post({
            title: title,
            category: category,
            imgSrc: imgSource,
            cardContent: text,
            postContent: content,
            date: posstedDate,
            featured: featured
        });
        blogPost.save();

        res.redirect("/");
    } else {
        const blogPost = new Post({
            title: title,
            category: category,
            imgSrc: imgSource,
            cardContent: text,
            postContent: content,
            date: posstedDate,
            featured: featured
        });
        blogPost.save();
        res.redirect("/" + category);
    }


})
app.post('/delete', (req, res) => {
    const id = req.body.id;

    Post.findByIdAndDelete(id).then((result) => {
        console.log(result);
    }).catch((err)=>{
        console.log(err);
    })

    res.redirect('/delete');
})

app.post('/update-form', (req, res) => {
    const id = req.body.id;
    console.log(id);
    Post.findById({ _id: id }).exec().then((result) => {
        res.render('edit', { docs: result });

    }).catch((err)=>{
        console.log(err);
    })
})

app.post('/edit-form', (req, res) => {
    const title = req.body.title;
    const category = req.body.category;
    const content = req.body.content;
    const id = req.body.id;
    console.log(id);
    Post.findOneAndUpdate({ _id: id }, { title: title, category: category, postContent: content }).then((result) => {
        res.redirect('/' + category)
    }).catch((err)=>{
        console.log(err);
    })

});


app.post('/login', (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.logIn(user, (err) => {
        if (!err) {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/admin');
            })
        }

        else
            console.log(err);
    })



})
app.post('/comment', (req, res) => {
    const id = req.body.commentBtn;
    const category = req.body.categoryComment;
    console.log(category);
    if (req.isAuthenticated()) {
        const comment = {
            name: req.user.displayName,
            imageSrc: req.user.imageSrc,
            id: req.user.id,
            comment: req.body.comment
        }
        console.log(comment);
        Post.updateOne({ _id: id }, { $push: { comment: { $each: [comment], $position: 0 } } }).then((result) => {
            res.redirect('/' + category + '/' + id);
        }).catch((err)=>{
            console.log(err);
        })


    } else {
        res.redirect('/login')
    }
})

app.post('/reply', (req, res) => {

    const id = req.body.replyBtn;
    const category = req.body.categoryComment;
    const postId = req.body.postId;

    if (req.isAuthenticated()) {
        const reply = {
            name: req.user.displayName,
            imageSrc: req.user.imageSrc,
            reply: req.body.reply
        }

        Post.updateOne({ "comment._id": id }, { $push: { "comment.$.reply": { $each: [reply], $position: 0 } } }).then((result) => {
            console.log(result);
            res.redirect('/' + category + '/' + postId);
        }).catch((err)=>{
            console.log(err);
        })
    }
    else {
        res.redirect('/login');
    }
})


app.listen(3000, function (req, res) {
    console.log("listening in port 3000");
})