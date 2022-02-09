require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));

// connect Db
mongoose.connect(process.env.DB_URL.replace('<PASSWORD>', process.env.DB_KEY), {useNewUrlParser: true}).then(console.log('connected successfully'))

//::::::: create mongoose Schema 
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

//:::::::::::: Encrypt Only the password


userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password']});

const User = new mongoose.model('User', userSchema);

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



app.post('/register', (req, res)=>{
    const newUser = new User(
        {
        email: req.body.username,
        password: req.body.password
        })

        newUser.save((err)=>{
            if(err){
                console.log(err)
            }else{
                res.render('secrets')
            }
        })
        
})


app.post('/login', (req , res)=> {
    const userEmail = req.body.username;
    const userPassword = req.body.password;

    User.findOne({email: userEmail}, (err , foundUser)=>{
        if(err){
            console.log(err)
        }else if(foundUser){
            if(foundUser.password === userPassword){
                res.render('secrets')
            }
        }else{
            res.redirect('/register')
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