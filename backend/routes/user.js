const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash =>  {
      const user = new User({
      email: req.body.email,
      password: hash
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'User created!',
            result: result
          })
        })
        .catch(err => {
          res.status(500).json({
            error: err
          });
        });
    })
  });

  router.post('/login', (req, res, next) => {
    let fetchedUser;
    User.findOne({email: req.body.email})
      .then(user => {
        if (!user) {
          return res.status(401).json()({
            message: 'Auth failed',
          });
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password);})
        .then(match => {
          if (!match) {
            return res.status(401).json({
              message: 'Auth failed in compare',
            });
            }
             const token = jwt.sign(
                {email: fetchedUser.email, userId: fetchedUser._id}, // payload
                'secret_this_should_be_longer',
                {expiresIn: '1h'}
                );
              res.status(200).json({
                token: token,
                expiresIn: 3600,
                userId: fetchedUser._id
              })
          })
          .catch(err => {
            return res.status(401).json({
              message: 'Auth failed : error' + err.message,
            });
          })

      })


module.exports = router;
