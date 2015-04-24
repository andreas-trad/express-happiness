// Load required packages
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

// Create our Express application
var app = express();

app.set('views', __dirname + '/views');
app.engine('html', require('uinexpress').__express)
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
// Use the body-parser package in our application
app.use(bodyParser.json());

// Create our Express router
var router = express.Router();

// Create endpoint handler for /kpis
var expressHappiness = require('express-happiness');

var path = require('path');
var appDir = path.dirname(require.main.filename);
var eh = new expressHappiness(app, router, {
    mockData:{
        enable: true,
        folder: appDir + '/mockdata',
        global: true
    },
    reusableFieldsFile: appDir + '/reusableFields.js',
    errorFile:appDir + '/errors.log',
    errorsConfigurationFile:appDir + '/conf/errors.js',
    apiConfigurationFile:appDir + '/conf/restConf.js',
    controllersFile:appDir + '/controllerFunctions.js'
});


eh.generate('',
    {
    },
    {
    }
);



// Start the server
app.listen(3000);