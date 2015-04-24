var erH, reusableRequiredFields;
var validator = require('validator');
var moment = require('moment');
var restConf = {};

exports.assignConf = function(conf){
    restConf = conf;
}

exports.init = function(confObj){
    errorHandler = require('./ErrorHandler.js');
    erH = new errorHandler(confObj.errorFile, confObj.errorsConfigurationFile);
    reusableRequiredFields = require(confObj.reusableFieldsFile);
}

var unitValidator = {
    int: function(field, value, path, errors, callback){
        if(!validator.isInt(value)){
            errors.push(path.join('.') + ' must be an integer. ' + value + ' provided.');
        } else {
            if(!!field.min){
                if(value < field.min){
                    errors.push(path.join('.') + ' must be greater or equal to ' + field.min + '. ' + value + ' provided.');
                }
            }
            if(!!field.max){
                if(value > field.min){
                    errors.push(path.join('.') + ' must be lower or equal to ' + field.max + '. ' + value + ' provided.');
                }
            }
        }
        callback();
    },

    date: function(field, value, path, errors, callback){
        var momentObj = moment(value, field.validationString);
        if(!momentObj.isValid()){
            errors.push(path.join('.') + ' must be a date in the format: '+ field.validationString +'. ' + value + ' provided.');
        } else {
            // in case of dates, for easiness we keep the momentObj representation of the passed variable, no matter
            // which is the format of the date that we expect
            //req.filteredParams[path.join('.') + field.key].momentObj = momentObj;
        }
        callback();
    },

    oneof: function(field, value, path, errors, callback){
        if(field.acceptedValues.indexOf(value) == -1){
            errors.push(path.join('.') + ' must be one of ' + field.acceptedValues.join(', ') + '. ' + value + ' provided.');
        }
        callback();
    },

    boolean: function(field, value, path, errors, callback){
        if(value !== true && value !== false && value !== 'true' && value !== 'false'){
            errors.push(path.join('.') + ' must be a boolean. ' + value + ' provided.');
        }
        callback();
    },

    numeric: function(field, value, path, errors, callback){
        if(!validator.isFloat(value)){
            errors.push(path.join('.') + ' must be a number. ' + value + ' provided.');
        }
        callback();
    },

    string: function(field, value, path, errors, callback){
        if(!!field.minChars){
            if(value.length < field.minChars){
                errors.push(path.join('.') + ' must be of at least ' + field.minChars + ' long.' + value + ' provided.');
            }
        }
        if(!!field.maxChars){
            if(value.length > field.maxChars){
                errors.push(path.join('.') + ' must be of at max ' + field.maxChars + ' long.' + value + ' provided.');
            }
        }
        callback();
    },

    array: function(field, value, path, errors){
        callback();
    }

};


var firstLevelIterator = function(fields, errors, req, func, callback){
    var index = 0;
    var done = false;
    var iterations = fields.length;
    var loop = {
        next: function(){
            if(done){
                return;
            }

            if(index < iterations){
                var self = this;
                var theField = fields[index];
                unitValidate(theField, errors, req, [theField.key],
                    function(){
                        index++;
                        func(self);
                    }
                );
            } else {
                done = true;
                callback();
            }
        }
    }

    loop.next();
    return loop;
}


var validate = function(obj, errors, req, path, func, callback) {
    var index = 0;
    var done = false;
    var iterations = Object.keys(obj.keys).length;
    var objKeys = Object.keys(obj.keys);
    var loop = {
        next: function() {
            if (done) {
                return;
            }

            if (index < iterations) {
                var newPath = path.slice();
                newPath.push(objKeys[index]);
                var self = this;
                unitValidate(obj.keys[objKeys[index]], errors, req, newPath, function(){
                    index++;
                    func(self);
                });

            } else {
                done = true;
                callback();
            }
        }
    };

    loop.next();
    return loop;
};

/*
 @unit: the unit to be validated taken from the signature
 @req: the request object
 @path: the base path of the current unit. It's an array
 @isRoot: a boolean indicating whether the passed unit is the root definition object or not
 @unitValidator: an instance of the unitValidator object defined above
 @callback: the callback to be called after the validation process
 */
var unitValidate = function(unit, errors, req, path, callback){
    var get = req.expressHappiness.get;
    var set = req.expressHappiness.set;

    // step 1: check if the parameter is present if it's mandatory according to the signature
    var mandatoryIssue = false;
    if(path.length > 0){
        if(unit.mandatory){
            try{
                var test_var = get(path[0]);
                for(var i=1; i<path.length; i++){
                    test_var = test_var[path[i]];
                }
                if(test_var === undefined || test_var === null){
                    errors.push(path.join('.') + ' is mandatory. Though is missing');
                    mandatoryIssue = true;
                }
            } catch(e){
                errors.push(path.join('.') + ' is mandatory. Though is missing');
                mandatoryIssue = true;
            }
        }
    }

    if(!mandatoryIssue){
        if(unit.type === 'object'){
            validate(unit, errors, req, path, function(loop){
                loop.next();
            }, callback)
        } else {
            try{
                var value = get(path[0]);
                for(var i=1; i<path.length; i++){
                    value = value[path[i]];
                }
                if(value === undefined || value === null){
                    callback();
                } else {
                    var validationFunct = unitValidator[unit.type];
                    validationFunct(unit, value, path, errors, callback);
                }
            } catch(e){
                callback();
            }
        }
    } else {
        callback();
    }

};



exports.validateAttrs = function(req, res, next){
    var get = req.expressHappiness.get;
    var set = req.expressHappiness.set;

    if(! restConf.routes[req.expressHappiness.apipath[0]] && !req.isRoot){
        var err = new Error();
        err.type = '404';
        return next(err);
    } else if(! restConf.routes[req.expressHappiness.apipath[0]] && req.isRoot){
        return next();
    } else {
        var currentNode = restConf.routes[req.expressHappiness.apipath[0]];
        for(var i=1; i<req.expressHappiness.apipath.length; i++){
            currentNode = currentNode.subRoutes[req.expressHappiness.apipath[i]];
            if(!currentNode){
                var err = new Error();
                err.type = '404';
                return next(err);
                break;
            }
        }

        if(!currentNode[req.expressHappiness.apiMethod].fields){
            return next();
        }

        var errors = [];

        firstLevelIterator(currentNode[req.expressHappiness.apiMethod].fields, errors, req, function(loop){
            loop.next();
        }, function() {
            if (errors.length > 0) {
                var err = new Error();
                err.type = 'invalidAttrs';
                err.details = errors;
                return next(err);
            } else {
                return next();
            }
        });
    }
}

var turnToFiltered = function(params){
    var filtered = {};
    for(k in params){
        filtered[k] = {
            value: params[k]
        };
    }
    return filtered;
}