// app/routes.js

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        if(req.user){
            res.redirect('/board')
        }else{
            res.render('index.ejs');
        }

    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {
        if(req.user){
            res.redirect('/board')
        }else{
            res.render('login.ejs', {message: req.flash('loginMessage')});
        }
        // render the page and pass in any flash data if it exists

    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/board', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function (req, res) {
        if(req.user){
            res.redirect('/board')
        }else{
            res.render('signup.ejs', {message: req.flash('signupMessage')});
        }

    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/board', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function (req, res) {

        res.render('profile.ejs', {

            user: req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // BOARD ===============================
    // =====================================
    app.get('/board', isLoggedIn, function (req, res) {
        var Task = require('../app/models/task');
        Task.find({'task.realization' :{ $lt: 100}}, function (err, tasks) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err);

            res.render('board.ejs', {
                tasks: tasks
            });
        });
    });


    // =====================================
    // CREATE TASK =========================
    // =====================================
    app.get('/create', isLoggedIn, function (req, res) {
        var User = require('../app/models/user');
        User.find(function (err, users) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err);

            res.render('create.ejs', {
                users: users
            });
        });

    });

    app.post('/create', function (req, res, done) {
        var Task = require('../app/models/task');
        newTask = new Task();
        newTask.task.name = req.body.name;
        newTask.task.description = req.body.description;
        newTask.task.realization = 0;
        newTask.task.employee = req.body.employee;
        newTask.save(function (err) {
            if (err)
                throw err;
            return done(null, newTask);
        });
        res.redirect('/board');
    });


    // =====================================
    // SHOW TASK =========================
    // =====================================
    app.get('/show/:task', isLoggedIn, function (req, res) {
        var Task = require('../app/models/task');
        var Comment = require('../app/models/comment');

        Task.find({'_id': req.params.task}, function (err, info) {
            if (err)
                res.send(err);

            Comment.find({'task_id': req.params.task}, function (err, comments) {
                if (err)
                    res.send(err);

                res.render('show.ejs', {
                    info: info,
                    comments: comments
                });

            });


        });


    });

    app.post('/show/:task', isLoggedIn, function (req, res, done) {
        var Task = require('../app/models/task');
        var Comment = require('../app/models/comment');

              if(req.body != undefined && req.body.realization != undefined &&
                  req.body.realization != "" && req.body.realization != null){

                  Task.findOne({ _id : req.params.task }, function (err, doc){
                      doc.task.realization = req.body.realization;
                      console.log(req.body.realization);
                      doc.save();
                      res.send(doc.task);
                  });

              }else {
                  newComment = new Comment();
                  newComment.comment.name = req.user.local.email;
                  console.log(req.user.local.email);
                  newComment.comment.text = req.body.comment;
                  console.log(req.body.comment);
                  newComment.task_id = req.params.task;
                  console.log(req.params.task);
                  newComment.save(function (err) {
                          if (err)
                              throw err;

                          return done(null, newComment);
                      });
                    console.log("DONE");
                    
                     res.send(newComment);
                    console.log(newComment);
                      //res.send(info.realization);

              }



    });

    app.del('/show/:task', isLoggedIn, function (req, res) {
        var Task = require('../app/models/task');

        Task.findOne({ _id : req.params.task }, function (err, doc){
           doc.remove();

            res.send("Usunięty");
        });


    });

    app.get('/edit/:task', isLoggedIn, function (req, res) {
        var Task = require('../app/models/task');
        var User = require('../app/models/user');

        Task.find({'_id': req.params.task}, function (err, info) {
            if (err)
                res.send(err);

            User.find(function (err, users) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                res.render('edit.ejs', {
                    info: info,
                    users: users
                });
            });



        });
    });

    app.post('/edit/:task', function (req, res, done) {
        var Task = require('../app/models/task');
     Task.findOne({ _id : req.params.task }, function (err, doc){
            doc.task.name = req.body.name;
            doc.task.description = req.body.description;
            doc.task.employee = req.body.employee;
            doc.save();
            res.send(doc.task);
            res.redirect('/show/' + req.params.task);
        });

    });

    app.get('/about', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('about.ejs');
    });

    app.get('/done', function (req, res) {
        var Task = require('../app/models/task');
        Task.find({ 'task.realization' : 100 }, function (err, tasks){

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err);

            res.render('done.ejs', {
                tasks: tasks
            });
        });

    });

};


// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

