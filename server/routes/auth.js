const express = require('express');
const User = require('./../models/user');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/signin', async (req, res) => {
  const { username, password, rememberMe } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res
      .status(400)
      .render('user/signin', { error: 'Wrong username or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res
      .status(400)
      .render('user/signin', { error: 'Wrong username or password' });
  }

  res.setHeader('user', user.id);
  req.user = user;
  res.redirect('/user/authenticated');
});

router.post('/signup', async (req, res) => {
  const {
    firstname,
    lastname,
    username,
    password,
    password2,
    acceptTos, // either "on" or undefined
    avatar,
  } = req.body;

  // Check password quality
  if (password !== password2) {
    return res
      .status(400)
      .render('user/signup', { error: 'passwords do not match' });
  }
  // Check username is unique
  let user = await User.findOne({ username });
  if (user) {
    return res
      .status(400)
      .render('user/signup', { error: `${username}: username already used` });
  }

  const password_hash = await bcrypt.hash(password, 10);

  user = await User.create({
    firstname,
    lastname,
    username,
    avatar,
    password_hash,
  });

  req.user = user;

  res.redirect('/user/authenticated'); // this is only to exit tests, change on implementations
});

router.get('/signout', (req, res) => {
  //no user: A GET request to `/user/logout` will redirect to `/`
  if (req.session && req.session.user) {

  }
  res.redirect('/');
});

// renders sign up page
router.get('/signup', (req, res) => {
  // user: A GET request to `/user/signup` will redirect to `/`
  if (req.session && req.session.user) {
    res.redirect('/');
  }
  res.render('user/signup');
});

// renders sign in page
router.get('/signin', (req, res) => {
  // user: A GET request to `/user/signin` will redirect to `/user/authenticated`

  if (req.session && req.session.user) {
    res.redirect('/user/authenticated')
  }
  res.render('user/signin');
});

router.get('/authenticated', (req, res) => {
  //no user: A GET request to `/user/authenticated` will redirect to `/`
  if (req.session && req.session.user) {
    res.render('user/authenticated');
  }
  res.redirect('/');
});

module.exports = router;
