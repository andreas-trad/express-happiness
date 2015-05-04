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

var validateEmail = function(email){
    var re = /^[a-zA-Z0-9+._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
}

var hasTheErrorKey = function(field, errorKey){
    if(filed.validationFailureTexts != null && field.validationFailureTexts != undefined){
        if(field.validationFailureTexts[errorKey] != null && field.validationFailureTexts[errorKey] != undefined){
            return field.validationFailureTexts[errorKey]
        }
    }
    return false;
}

var unitValidator = {
    int: function(field, value, path, errors, callback){
        var fieldNameOnResponse = field.humanReadable || path.join('.');

        if(!validator.isInt(value)){
            var er_message = hasTheErrorKey(field, 'type');
            if(er_message === false){
                errors.push(fieldNameOnResponse + ' must be an integer. ' + value + ' provided.');
            } else {
                errors.push(er_message);
            }
        } else {
            if(!!field.min){
                if(value < field.min){
                    var er_message = hasTheErrorKey(field, 'min');
                    if(er_message === false){
                        errors.push(fieldNameOnResponse + ' must be greater or equal to ' + field.min + '. ' + value + ' provided.');
                    } else {
                        errors.push(er_message);
                    }
                }
            }
            if(!!field.max){
                if(value > field.min){
                    var er_message = hasTheErrorKey(field, 'max');
                    if(er_message === false) {
                        errors.push(fieldNameOnResponse + ' must be lower or equal to ' + field.max + '. ' + value + ' provided.');
                    } else {
                        errors.push(er_message);
                    }
                }
            }
        }
        callback();
    },

    date: function(field, value, path, errors, callback){
        var fieldNameOnResponse = field.humanReadable || path.join('.');

        var momentObj = moment(value, field.validationString);
        if(!momentObj.isValid()){
            var er_message = hasTheErrorKey(field, 'validationString');
            if(er_message === false) {
                errors.push(fieldNameOnResponse + ' must be a date in the format: ' + field.validationString + '. ' + value + ' provided.');
            } else {
                errors.push(er_message);
            }
        } else {
            // in case of dates, for easiness we keep the momentObj representation of the passed variable, no matter
            // which is the format of the date that we expect
            //req.filteredParams[path.join('.') + field.key].momentObj = momentObj;
        }
        callback();
    },

    oneof: function(field, value, path, errors, callback){
        var fieldNameOnResponse = field.humanReadable || path.join('.');

        if(field.acceptedValues.indexOf(value) == -1){
            var er_message = hasTheErrorKey(field, 'acceptedValues');
            if(er_message === false) {
                errors.push(fieldNameOnResponse + ' must be one of ' + field.acceptedValues.join(', ') + '. ' + value + ' provided.');
            } else {
                errors.push(er_message);
            }
        }
        callback();
    },

    boolean: function(field, value, path, errors, callback){
        var fieldNameOnResponse = field.humanReadable || path.join('.');

        if(value !== true && value !== false && value !== 'true' && value !== 'false'){
            var er_message = hasTheErrorKey(field, 'type');
            if(er_message === false) {
                errors.push(fieldNameOnResponse + ' must be a boolean. ' + value + ' provided.');
            } else {
                errors.push(er_message);
            }
        }
        callback();
    },

    numeric: function(field, value, path, errors, callback){
        var fieldNameOnResponse = field.humanReadable || path.join('.');

        if(!validator.isFloat(value)){
            var er_message = hasTheErrorKey(field, 'type');
            if(er_message === false) {
                errors.push(fieldNameOnResponse + ' must be a number. ' + value + ' provided.');
            } else {
                errors.push(er_message);
            }
        }
        callback();
    },

    email: function(field, value, path, errors, callback){
        var fieldNameOnResponse = field.humanReadable || path.join('.');

        if(!validateEmail(value)){
            var er_message = hasTheErrorKey(field, 'type');
            if(er_message === false) {
                errors.push(fieldNameOnResponse + ' must be a valid email address. ' + value + ' provided.');
            } else {
                errors.push(er_message);
            }
        }
        callback();
    },

    string: function(field, value, path, errors, callback){
        var fieldNameOnResponse = field.humanReadable || path.join('.');

        if(!!field.minChars){
            if(value.length < field.minChars){
                var er_message = hasTheErrorKey(field, 'minChars');
                if(er_message === false) {
                    errors.push(fieldNameOnResponse + ' must be of at least ' + field.minChars + ' long. ' + value + ' provided.');
                } else {
                    errors.push(er_message);
                }
            }
        }
        if(!!field.maxChars){
            if(value.length > field.maxChars){
                var er_message = hasTheErrorKey(field, 'maxChars');
                if(er_message === false) {
                    errors.push(fieldNameOnResponse + ' must be of at max ' + field.maxChars + ' long. ' + value + ' provided.');
                } else {
                    errors.push(er_message);
                }
            }
        }
        if(!!filed.regexp){
            var er_message = hasTheErrorKey(field, 'type');
            try{
                var passes = field.regexp.test(value);
                if(!passes){
                    if(er_message === false) {
                        errors.push(fieldNameOnResponse + ' do not match the provided regular expression');
                    } else {
                        errors.push(er_message);
                    }
                }
            } catch(err){
                if(er_message === false) {
                    errors.push(fieldNameOnResponse + ' do not match the provided regular expression');
                } else {
                    errors.push(er_message);
                }
            }
        }
        callback();
    },

    array: function(field, value, path, errors){
        var fieldNameOnResponse = field.humanReadable || path.join('.');

        if(!(variable.constructor === Array)){
            var er_message = hasTheErrorKey(field, 'type');
            if(er_message === false) {
                errors.push(fieldNameOnResponse + ' must be of type array. ' + value + ' provided.');
            } else {
                errors.push(er_message);
            }
        }
        if(!!field.minLength){
            if(value.length < field.minLength){
                var er_message = hasTheErrorKey(field, 'minLength');
                if(er_message === false) {
                    errors.push(fieldNameOnResponse + ' must be of at least of ' + field.minLength + ' length. ' + value + ' provided.');
                } else {
                    errors.push(er_message);
                }
            }
        }
        if(!!field.maxLength){
            if(value.length > field.maxLength){
                var er_message = hasTheErrorKey(field, 'maxLength');
                if(er_message === false) {
                    errors.push(fieldNameOnResponse + ' must be of max length ' + field.maxLength + '. ' + value + ' provided.');
                } else {
                    errors.push(er_message);
                }
            }
        }
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