const express = require('express');
const passport = require('passport');
const User = require('../models/user');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register',
    error: null,
    values: {},
  });
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, age, gender, fitnessGoal } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'Username already exists.',
        values: req.body,
      });
    }

    const user = await User.create({
      username,
      password,
      age,
      gender,
      fitnessGoal,
    });

    req.login(user, (loginError) => {
      if (loginError) {
        return res.status(500).send('Login failed');
      }

      return res.redirect('/workouts');
    });
  } catch (error) {
    return res.status(400).render('register', {
      title: 'Register',
      error: error.message,
      values: req.body,
    });
  }
});

router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login',
    error: req.query.error ? 'Invalid username or password.' : null,
    values: {},
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, user) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.redirect('/login?error=1');
    }

    req.login(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      return res.redirect('/workouts');
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout((error) => {
    if (error) {
      return res.status(500).send('Logout failed');
    }

    return res.redirect('/login');
  });
});

module.exports = router;
