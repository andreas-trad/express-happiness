var restConf = {
    routes:[]
}
var kpis
    ,rcv;
var fs = require('fs');
var colors = require('colors');
var flatSignature = [];
var app, router, confObj;
var _mockOperations = {};


var eh = function(p_app, p_router, conf){
    app = p_app;
    router = p_router;
    var path = require('path');
    var appDir = path.dirname(require.main.filename);
    this.generate = successGenerate;

    confObj = {
        mockData:{
            enable: false,
            folder: appDir + '/mockJSONs'
        },
        configurationFile:appDir + '/expressHappiness/conf/conf.js',
        reusableFieldsFile: appDir + '/expressHappiness/reusableFields.js',
        errorFile:appDir + '/expressHappiness/errors.log',
        errorsConfigurationFile:appDir + '/expressHappiness/conf/errors.js',
        apiConfigurationFile:appDir + '/expressHappiness/conf/restConf.js',
        controllersFile:appDir + '/expressHappiness/controllerFunctions.js'
    };

    if(!conf){
        conf = {};
    }
    for(var propertyName in conf) {
        if(conf.hasOwnProperty(propertyName)){
            confObj[propertyName] = conf[propertyName];
        }
    }

    var errorOccurred = false
    if(!fs.existsSync(confObj.configurationFile)){
        errorOccurred = true;
        var msg = "Configuration file (" + confObj.configurationFile + ") does not exist. Please create it according the documentation";
        console.log(msg.red.bgWhite);
    } else {
        _mockOperations = require(confObj.configurationFile).conf.mockOperations;
    }
    if(!fs.existsSync(confObj.reusableFieldsFile)){
        errorOccurred = true;
        var msg = "Reusable fields file (" + confObj.reusableFieldsFile + ") does not exist. Please create it according the documentation";
        console.log(msg.red.bgWhite);
    }
    if(!fs.existsSync(confObj.errorFile)){
        errorOccurred = true;
        var msg = "Error log file (" + confObj.errorFile + ") does not exist. Please create it according the documentation";
        console.log(msg.red.bgWhite);
    }
    if(!fs.existsSync(confObj.errorsConfigurationFile)){
        errorOccurred = true;
        var msg = "Errors configuration file (" + confObj.errorsConfigurationFile + ") does not exist. Please create it according the documentation"
        console.log(msg.red.bgWhite);
    }
    if(!fs.existsSync(confObj.apiConfigurationFile)){
        errorOccurred = true;
        var msg = "REST API configuration file (" + confObj.apiConfigurationFile + ") does not exist. Please create it according the documentation"
        console.log(msg.red.bgWhite);
    }
    if(!fs.existsSync(confObj.controllersFile)){
        errorOccurred = true;
        var msg = "Controller functions definition file (" + confObj.controllersFile + ") does not exist. Please create it according the documentation"
        console.log(msg.red.bgWhite);
    }
    if(confObj.mockData.enable && !fs.existsSync(confObj.mockData.folder)){
        errorOccurred = true;
        var msg = "Mock data folder (" + confObj.mockData.folder + ") does not exist. Please create it according the documentation"
        console.log(msg.red.bgWhite);
    }

    if(errorOccurred){
        this.generate = failureGenerate;
    } else {
        // Rest validation initialization
        var FL = require('./fieldsLoader.js');
        var fieldsLoader = new FL(confObj.reusableFieldsFile);
        restConf = require(confObj.apiConfigurationFile).conf(fieldsLoader);

        global.expressHappiness = {
            confObj: confObj
        };
        // TODO change the folder
        rcv = require('./RESTcallsValidator.js');
        rcv.init(confObj);
        rcv.assignConf(restConf);
        kpis = require(confObj.controllersFile);
    }

    this.start = function(port){
        if(!port){
            var msg = "Please enter the port number for the app to run. Exiting.";
            console.log(msg.red.bgWhite);
            process.exit(1);
        } else {
            isPortTaken(port, function(err, taken){
                if(taken) {
                    var msg = 'Port ' + port + ' is been used by another application. Exiting.';
                    console.log(msg.red.bgWhite);
                    process.exit(1);
                } else {
                    p_app.listen(port);
                    var msg = 'The application is listening on port ' + port + ' for connections.';
                    console.log(msg.green);
                }
            });
        }
    }

}

/*
checks if the port is taken
 */
var isPortTaken = function(port, fn) {
    var net = require('net')
    var tester = net.createServer()
        .once('error', function (err) {
            if (err.code != 'EADDRINUSE') return fn(err)
            fn(null, true)
        })
        .once('listening', function() {
            tester.once('close', function() { fn(null, false) })
                .close()
        })
        .listen(port)
}


/* Reads the restConf and generates all available routes according to it.
 Also, it acts as debugger. For each of the generated routes the generate function checks if there is
 a corresponding method defined on the kpi controller, if there is mock data file available and it logs everything
 to the console.
 Missing methods are replaced by a generic one which handles their absence.
 Also, routes that do not provide mock data are configured so noMockAvailable function will be called whenever
 mock operation is on for them. For routes that actually have corresponding mock data files available the
 makeMockQuery function will be invoked for mock operation cases. Also, for efficiency reasons the makeMockQuery function
 for each of the routes that actually provide mock data is been generated once here (by reading the corresponding file)
 and it's been passed, so only one file read occurs for each route, only once, only at the kick off.
 It takes three parameters:
 @ router [object]: express framework router object
 @ baseUrl [string]: the base url of the routes to create
 @ preValidationMiddlewares [array][array]: holds all the middlewares that should be applied to the specific routes. These middlewares are been applied before validation
 it is an associative array. On restConf.js file each route might belong to one or more groups. For each group there might be different middlewares applied.
 This is achieved by using the group names as the first level keys of the array. Each key will hold another array which actual holds
 all the middlewares to be applied to the specific groups. Example:
 preValidationMiddlewares ~=
 [
 'userAccess':[middlewareName1, middleware2],
 'adminAccess':[middlewareName3, middleware4]
 ]
 if we want to apply a middleware to all of the routes, no matter what then we can define this by including it on the key "eh-allRoutes".
 Example:
 preValidationMiddlewares ~=
 [
 'groupNameOne':[middlewareName1, middleware2],
 'groupNameTwo':[middlewareName3, middleware4],
 'eh-allRoutes':[middlewareToBeAppliedToAllRoutes1, middlewareToBeAppliedToAllRoutes2]
 ]
 @ postValidationMiddlewares [array][array]: holds all the middlewares that should be applied after the validation process and before the controller function invocation
 it is an associative array. On restConf.js file each route might belong to one or more groups. For each group there might be different middlewares applied.
 This is achieved by using the group names as the first level keys of the array. Each key will hold another array which actual holds
 all the middlewares to be applied to the specific groups. Example:
 postValidationMiddlewares ~=
 [
 'groupNameOne':[middlewareName1, middleware2],
 'groupNameTwo':[middlewareName3, middleware4]
 ]
 if we want to apply a middleware to all of the routes, no matter what then we can define this by including it on the key "eh-allRoutes".
 Example:
 postValidationMiddlewares ~=
 [
 'groupNameOne':[middlewareName1, middleware2],
 'groupNameTwo':[middlewareName3, middleware4],
 'eh-allRoutes':[middlewareToBeAppliedToAllRoutes1, middlewareToBeAppliedToAllRoutes2]
 ]
 */
var successGenerate = function(baseUrl, preValidationMiddlewares, postValidationMiddlewares){
    var theRoute = router.route(baseUrl + '/');
    theRoute.get(putMethodsOnReq('get'));
    theRoute.get(putApipathToReq([], ''));
    theRoute.get(function(req, res, next){
        req.isRoot = true;
        return next();
    });
    for(var i=0; i<preValidationMiddlewares.length; i++){
        theRoute.all(preValidationMiddlewares[i]);
    }
    theRoute.get(function(req, res){
        var fs = require('fs');
        fs.readFile(__dirname + '/views/index.html', { 'encoding':'utf8'}, function(err, data){
            if(err){
                console.log(err);
            } else {
                var _ = require('underscore');
                var template = _.template(data);
                res.send(template({signature:flatSignature}));
            }
        });
        //res.render('null', {layout:'./index', signature:flatSignature});
    });


    var routeObject = {
        subRoutes:  restConf.routes
    };

    generateNodeRoutes(routeObject, '', [], router, baseUrl, preValidationMiddlewares, postValidationMiddlewares, []);
    registerErrors(app, confObj.errorsConfigurationFile, confObj.errorFile);
};

var failureGenerate = function(){
    console.log("Routes generation process skipped due to errors. Please fix the errors accordingly and retry".red.bgWhite);
    process.exit(0);
}

module.exports = eh;

var generateNodeRoutes = function(node, nodeName, path, router, baseUrl, preValidationMiddlewares, postValidationMiddlewares, inheritedGroups){
    if(node.hasOwnProperty('groups')){
        inheritedGroups = node.groups;
    }
    var supportedTypes = ['get', 'post', 'put', 'delete'];

    for(var k=0; k<supportedTypes.length; k++){
        if(node.hasOwnProperty(supportedTypes[k])){
            if(node[supportedTypes[k]].hasOwnProperty('groups')){
                inheritedGroups = node[supportedTypes[k]].groups;
            }
            flatSignature.push({
                type: supportedTypes[k],
                node:node[supportedTypes[k]],
                path:baseUrl + path.join('/') + '/' + nodeName
            });

            var mockQueryMiddleware = mockQueryGenerationMiddleWare(supportedTypes[k], path, nodeName, node[supportedTypes[k]].alias);

            var theRoute = router.route(baseUrl + path.join('/') + '/' + nodeName);
            theRoute[supportedTypes[k]](putMethodsOnReq(supportedTypes[k]));
            theRoute[supportedTypes[k]](putApipathToReq(path, nodeName, node[supportedTypes[k]].alias));

            if(preValidationMiddlewares.hasOwnProperty('eh-allRoutes')){
                for(var ii=0; ii<preValidationMiddlewares['eh-allRoutes'].length; ii++){
                    theRoute[supportedTypes[k]](preValidationMiddlewares['eh-allRoutes'][ii]);
                }
            }
            for(var i=0; i<inheritedGroups.length; i++){
                if(preValidationMiddlewares.hasOwnProperty(inheritedGroups[i])){
                    for(var ii=0; ii<preValidationMiddlewares[inheritedGroups[i]].length; ii++){
                        theRoute[supportedTypes[k]](preValidationMiddlewares[inheritedGroups[i]][ii]);
                    }
                }
            }

            theRoute[supportedTypes[k]](rcv.validateAttrs);
            theRoute[supportedTypes[k]](mockQueryMiddleware);
            theRoute[supportedTypes[k]](mockMiddlewareApplied);

            if(postValidationMiddlewares){
                if(postValidationMiddlewares.hasOwnProperty('eh-allRoutes')){
                    for(var ii=0; ii<postValidationMiddlewares['eh-allRoutes'].length; ii++){
                        theRoute[supportedTypes[k]](postValidationMiddlewares['eh-allRoutes'][ii]);
                    }
                }
                for(var i=0; i<inheritedGroups.length; i++){
                    if(postValidationMiddlewares.hasOwnProperty(inheritedGroups[i])){
                        for(var ii=0; ii<postValidationMiddlewares[inheritedGroups[i]].length; ii++){
                            theRoute[supportedTypes[k]](postValidationMiddlewares[inheritedGroups[i]][ii]);
                        }
                    }
                }
            }

            var aliasedFunction = false;
            if(node[supportedTypes[k]].alias){
                if(kpis.functions[node[supportedTypes[k]].alias] != undefined && kpis.functions[node[supportedTypes[k]].alias] != null){
                    theRoute[supportedTypes[k]](kpis.functions[node[supportedTypes[k]].alias]);
                    aliasedFunction = true;
                }
            }

            if(!aliasedFunction){
                if(kpis.functions[supportedTypes[k] + ":" + path.join('/') + '/' + nodeName] != undefined && kpis.functions[supportedTypes[k] + ":" + path.join('/') + '/' + nodeName] != null){
                    theRoute[supportedTypes[k]](kpis.functions[supportedTypes[k] + ":" + path.join('/') + '/' + nodeName]);
                } else {
                    var msg = '-- WARNING -- There is currently no control method defined for route ' + path.join('/') + '/' + nodeName + '. Please create it on /controllers/routesControllerFunctions.js and assign it to functions["' + path.join('/') + '/' + nodeName + '"]';
                    console.log(msg.red.bgWhite);
                    theRoute[supportedTypes[k]](noControlMethodCallback);
                }
            }


            console.log('Route ' + supportedTypes[k].toUpperCase() + ' "'  + path.join('/') + '/' + nodeName + '" created successfully'.green);
        }
    }

    if(node.hasOwnProperty('subRoutes')){
        var newPath = path.slice(0);
        newPath.push(nodeName);
        for(var property in node.subRoutes) {
            if(node.subRoutes.hasOwnProperty(property)){ // first we check that the property is not an inherited one
                generateNodeRoutes(node.subRoutes[property], property, newPath, router, baseUrl, preValidationMiddlewares, postValidationMiddlewares, inheritedGroups);
            }
        }
    }

    app.use('', router);
    app.get('*', function(req, res, next){
        var err = new Error();
        err.type = '404';
        return next(err);
    });
}


var putMethodsOnReq = function(method){
    return function(req, res, next){
        req.expressHappiness = {};
        req.expressHappiness.apiMethod = method;
        req.expressHappiness.get = getGetter(req);
        req.expressHappiness.set = getSetter(req);
        return next();
    }
}


var mockQueryGenerationMiddleWare = function(type, path, nodeName, alias){
    if(!global.expressHappiness.confObj.mockData.enable){
        return function(req, res, next){
            return next();
        }
    }

    var filename = '';
    var route = '';
    for(var i=1; i<path.length; i++){
        filename += path[i] + '.';
        route += path[i] + '/';
    }
    route += nodeName;
    filename += nodeName;

    if(alias){
        if(fs.existsSync(global.expressHappiness.confObj.mockData.folder + '/' + alias + '.json')){
            var mockData = require(global.expressHappiness.confObj.mockData.folder + '/' + alias + '.json');

            return function(req, res, next){
                req.expressHappiness.mockQuery = function(success){
                    success(mockData);
                }
                return next();
            }
        }
    }


    if(fs.existsSync(global.expressHappiness.confObj.mockData.folder + '/' + type + '.' + filename + '.json')){
        var mockData = require(global.expressHappiness.confObj.mockData.folder + '/' + type + '.' + filename + '.json');

        return function(req, res, next){
            req.expressHappiness.mockQuery = function(success){
                success(mockData);
            }
            return next();
        }
    } else {
        var msg = '-- WARNING -- No mock data found for ' + route + ' route. Please create file named ' + filename + '.json and place it on mockJSONs folder';
        console.log(msg.red.bgWhite);
        return function(req, res, next){
            req.expressHappiness.mockQuery = function(success){
                var err = new Error();
                err.type = 'noMockData';
                return next(err);
            };
            return next();
        }
    }
}

var getGetter = function(req){
    if(req.expressHappiness.apiMethod == 'get'){
        return function(key){
            return req.query[key];;
        }
    } else {
        return function (key) {
            return req.body[key];
        }
    }
}

var getSetter = function(req){
    if(req.expressHappiness.apiMethod == 'get'){
        return function(key, value){
            req.query[key] = value;
        }
    } else {
        return function(key, value){
            req.body[key] = value;
        }
    }
}


var noControlMethodCallback = function(req, res, next){
    var err = new Error("Under Development");
    err.type = 'underDevelopment';
    return next(err);
}

var putApipathToReq = function(path, nodeName, alias){
    return function(req, res, next){
        var newPath = path.slice(0);
        newPath.shift();
        newPath.push(nodeName);
        req.expressHappiness.apipath = newPath;
        req.expressHappiness.routeAlias = alias;
        return next();
    }
}


var mockMiddlewareApplied = function(req, res, next){
    if((req.expressHappiness.get('mock') != 1 && !_mockOperations[req.expressHappiness.apiMethod + ':' + req.route.path]
        && !_mockOperations[req.expressHappiness.routeAlias]) || !global.expressHappiness.confObj.mockData.enable){
        return next();
    } else {
        req.expressHappiness.mockQuery(function(results){
            return res.send(results);
        });
    }
}

var registerErrors = function(app, errorsConfigurationFile, errorFile){
    var errors = require(errorsConfigurationFile).errors;
    var undefinedError = {
        log:true,
        humanReadable: 'Unresolved error code',
        sendToClient: {
            code:500
        }
    };

    var invalidAttrs = {
        log:true,
        humanReadable: 'Invalid attributes passed',
        sendToClient: {
            code:400,
            data:'err.details'
        }
    };

    var fourZeroFour = {
        log:false,
        humanReadable: 'The requested resource does not exist',
        sendToClient: {
            code:404
        }
    };

    var noMockData = {
        log: true,
        humanReadable: 'There is no mock data available for this route yet',
        sendToClient: {
            code: 404,
            data:'There is no mock data available for this route yet'
        }
    };

    var underDevelopment = {
        log: false,
        humanReadable: 'A call to a route under development has been made',
        sendToClient:{
            code:501,
            data:'This route is currently under development'
        }
    };

    if(!errors.hasOwnProperty('undefinedError')) {
        errors.undefinedError = undefinedError;
    } else {
        errors.undefinedError = formatError(undefinedError, errors.undefinedError)
    }
    if(!errors.hasOwnProperty('invalidAttrs')) {
        errors.invalidAttrs = invalidAttrs;
    } else {
        errors.invalidAttrs = formatError(invalidAttrs, errors.invalidAttrs)
    }
    if(!errors.hasOwnProperty('404')) {
        errors['404'] = fourZeroFour;
    } else {
        errors['404'] = formatError(fourZeroFour, errors['404'])
    }
    if(!errors.hasOwnProperty('noMockData')) {
        errors.noMockData = noMockData;
    } else {
        errors.noMockData = formatError(noMockData, errors.noMockData)
    }
    if(!errors.hasOwnProperty('underDevelopment')) {
        errors.underDevelopment = underDevelopment;
    } else {
        errors.underDevelopment = formatError(underDevelopment, errors.underDevelopment)
    }

    var ErrorHandlerModule = require('./ErrorHandler.js');
    var ErrorHanlder = new ErrorHandlerModule(errorFile);
    app.use(function (err, req, res, next) {
        if(errors.hasOwnProperty(err.type)){
            ErrorHanlder.handleError(errors[err.type], err, req, res);
        } else {
            ErrorHanlder.handleError(errors.undefinedError, err, req, res);
        }
    });
};

var formatError = function(error, options){
    var keys = Object.keys(options);
    for(var i=0; i<keys.length; i++){
        var key = keys[i];
        error[key] = options[key];
    }
    return error;
}