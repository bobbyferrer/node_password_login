const express = require('express');
const expressLayouts = require('express-ejs-layouts'); //2
const mongoose = require('mongoose'); //3 config keys
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

// Passport config
require('./config/passport')(passport);

// DB CONFIG //3
const db = require('./config/keys').MongoURI;

// Connect to Mongo //4
mongoose
	.connect(db, { useNewUrlParser: true })
	.then(() => console.log('MongoDB Connected..'))
	.catch((err) => console.log(err));
// 2 EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Bodyparser //5
app.use(express.urlencoded({ extended: false }));

//Express Session
app.use(
	session({
		secret: 'secret',
		resave: true,
		saveUninitialized: true
	})
);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash());

//Global vars
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

//#1 Routes
app.use('/', require('./routes/index'));
app.use('/user', require('./routes/user'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
