const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => { // a middleware in express is just a function taking our three args
  try {
    console.log('IN MIDDELWARE', req.headers);
  const token = req.headers.authorization.split(' ')[1]; // "Bearer the_token_as_second_word"
  console.log(token);
  jwt.verify(token, 'secret_this_should_be_longer');
  console.log('AUTHORIZED');
  next();
  } catch (error) {
    res.status(401).json({
      message: 'Auth failed in middelware' + error.message
    })

  }
};
