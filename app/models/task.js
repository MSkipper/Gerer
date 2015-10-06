// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({

    task            : {
        name            : String,
        description     : String,
        realization     : Number,
        employee        : String
    },

    comment         :  {
        name            : String,
        comment         : String,
        date            : Date
    }

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Task', userSchema);

