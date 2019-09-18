const express = require('express');
const router  = express.Router();

// Middlewares
const check = require('../middlewares/activeMid')

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/checkMail' ,(req, res, next) => {
  const mail = req.user.email
  res.render('checkMail', {mail});
});

router.get('/profile', check.checkActive ,(req, res, next) => {
  const user = req.user
  res.render('profile', {user});
});

module.exports = router;
