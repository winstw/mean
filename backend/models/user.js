const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: {type: String, required: true, unique: true}, // unique is not a constraint, but allows optimizations
  password: {type: String, required: true},
});

userSchema.plugin(uniqueValidator); // now unique is constrained, thanks to the plugin

module.exports = mongoose.model('User', userSchema);
