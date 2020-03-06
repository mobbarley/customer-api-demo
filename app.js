var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;


var app = express();
const port = 3000;

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser cust_middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Globals
app.use( (request, response, next) => {
    response.locals.errors = null;
    next();
});

// Express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Set static path
app.use(express.static(path.join(__dirname, 'public')));

// Set main route
app.get('/', (request, response) => {
    // find all users
    db.users.find((err, docs) => {
        // render when found
        response.render('index', {
            title1: "Add Customers",
            title2: "Customers",
            users: docs
        });
    });
});

// Route for user addition
app.post('/users/add', (request, response) => {
    request.checkBody('first_name', 'First name is required').notEmpty();
    request.checkBody('last_name', 'Last name is required').notEmpty();
    request.checkBody('email', 'Email is required').notEmpty();
    request.checkBody('email', 'Invalid email').isEmail();

    var errors = request.validationErrors()

    if (errors) {
        response.render('index', {
            title1: "Add Customers",
            title2: "Customers",
            users: users,
            errors: errors
        });
    } else {
        var newUser = {
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            email: request.body.email
        };
        // Insert the users to DB
        db.users.insert(newUser, (err, result) => {
            if (err) {
                console.log(err);
            }
            response.redirect('/');
        });
    }
});

// Route for user deletion
app.delete('/users/delete/:id', (request, response) => {
    //console.log(request.params.id);
    db.users.remove({_id: ObjectId(request.params.id)}, (err, result) => {
        if (err) {
            console.log(err);
        }
        response.redirect('/');
    });
});

// Start the server
app.listen(port, () => {
    console.log('Server started on port '+port);
});
