var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({

    comment         :  {
        name            : String,
        text            : String,
        date            : { type:Date, default: Date.now }
    },
    task_id             : String

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Comment', userSchema);
