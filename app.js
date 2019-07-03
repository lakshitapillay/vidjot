const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const db = require('./config/keys').mongoURI;

const app = express();

//Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

//passport config
require('./config/passport')(passport);

//deprecation warning
mongoose.set('useNewUrlParser', true);

//connect to mongoose
mongoose.connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch( err => console.log(err));

mongoose.set('useFindAndModify', false); 
mongoose.set('useCreateIndex', true);

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//method override middleware
app.use(methodOverride('_method'))

//handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//How middleware works
app.use(function(req, res, next){
    //console.log(Date.now());
    next();
})

//session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash middleware
app.use(flash());

//global variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
})

//index route
app.get('/',(req, res) => {
    res.render('index');
});

//about route
app.get('/about', (req, res) => {
    res.render('about');
});

//use routes
app.use('/ideas', ideas);
app.use('/users', users);

const PORT = process.env.PORT || 5000;

app.listen(PORT,() => {
    console.log('Server is running...')
});
