const express = require('express'); //1
const router = express.Router(); //2
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User model
const User = require('../models/User');
// login page
router.get('/login', (req, res) => res.render('login')); //1
// register
router.get('/register', (req, res) => res.render('register')); //2

//Register Handle //6
router.post('/register', (req, res) => {
	// console.log(req.body); go to the ui registration and test
	// res.send('test');
	const { name, email, password, password2 } = req.body;
	let errors = [];

	//Check required fields
	if (!name || !email || !password || !password2) {
		errors.push({ msg: 'Please fill in all fields' });
	}

	//Check Password match
	if (password !== password2) {
		errors.push({ msg: 'Passwords do not match' });
	}

	// Check pass lenght
	if (password.length < 6) {
		errors.push({ msg: 'Password should be at lease 6 characters' });
	}

	if (errors.length > 0) {
		res.render('register', {
			errors,
			name,
			email,
			password,
			password2
		});
	} else {
		// Validation passed
		User.findOne({ email: email }).then((user) => {
			if (user) {
				//User exists
				errors.push({ msg: 'Email is already registered' });
				res.render('register', {
					errors,
					name,
					email,
					password,
					password2
				});
			} else {
				const newUser = new User({
					name,
					email,
					password
				});
				//Hashed Password
				bcrypt.genSalt(10, (err, salt) =>
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;

						//Set password to hashed
						newUser.password = hash;

						//Save user
						newUser
							.save()
							.then((user) => {
								req.flash('success_msg', 'You are now registered and can login');
								res.redirect('/user/login');
							})
							.catch((err) => console.log(err));
					})
				);
			}
		});
	}
});

// Login handle
router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/dashboard',
		failureRedirect: '/user/login',
		failureFlash: true
	})(req, res, next);
});

// Logout handle
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/user/login');
});

module.exports = router;
