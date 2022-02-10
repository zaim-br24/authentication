require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
const { Passport } = require('passport/lib');

// const bcrypt = require('bcrypt');
// const saltRounds = 10;
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5')

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

// connect Db
mongoose.connect(process.env.DB_URL.replace('<PASSWORD>', process.env.DB_KEY), {useNewUrlParser: true}).then(console.log('connected successfully'))

//::::::: create mongoose Schema 
const userSchema = new mongoose.Schema({
    username: String,
    password: String
})

userSchema.plugin(passportLocalMongoose)


// userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password']});

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//:::::::::::: handel routes

app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.get('/register', (req, res)=>{
    res.render('register')
})

app.get('/secrets', (req, res)=>{
    if(req.isAuthenticated()){
        res.render('secrets')
    }else{
        res.redirect('/login')
    }
})


app.get('/logout',(req, res)=>{

    req.logout();
    res.redirect('/');

});

app.post('/register', (req, res)=>{
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) { 
            console.log(err)
            res.redirect('/register')
         }
      
        passport.authenticate('local')(req , res , ()=>{
            res.redirect('/secrets')
        });
      });
    
})


app.post('/login', (req , res)=> {
    
    const user = new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user, (err)=>{
        if(err){
            console.log(err)
        }else{
            passport.authenticate('local')(req, res, ()=>{
                res.redirect('/secrets')
            })
        }
    })

})



//--------------------------- Decrypt PASSWORD -------------------
// app.post('/seeEncryptedPassword', (req , res)=> {
//     const email = req.body.email;
//     User.findOne({email: email}, (err , foundUser)=>{
//         if(err){
//             console.log(err)
//         }else if(foundUser){
//             res.send(foundUser)
//         }
//     })
// })






//::::::::::::: listen on port 4000

app.listen(4000, ()=> console.log('server is running on port 40000'))