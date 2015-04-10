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



/*
@signature: the call signature as defined on the configuration file
@req: the request object

The function checks all parameters passed using the rest API call signature
During validation the function creates and assigns three attributes to req object:
- req.signature: contains the signature of the specific call
- req.passedSignatureAttrs: contains an array of strings, holding the names of all signature fields actually passed on the call
- req.filteredParams: Associative array of objects. The keys of this array are the names of the call parameters.
    Each object has a "value" key that holds the value passed on the route
    Also, for date parameters there's also a special attribute called "momentObj". This is the moment object representation
    of the date passed
 */
var validate = function(signature, req) {
    // we assign to the signature key of req the call signature
    var get = req.expressHappiness.get;
    var set = req.expressHappiness.set;
    req.signature = signature;

    var reason = {
        errors: [],
        callSpecs: signature
    };

    // passedSignatureAttrs is an array that holds all keys of the signature fields that actually passed on the call
    req.passedSignatureAttrs = [];
    // filteredParams array, as explained on the function description
    if (!!req.params) {
        req.filteredParams = turnToFiltered(req.params);
    } else {
        req.filteredParams = {};
    }

    for(var i=0; i<signature.length; i++){
        var field = signature[i];

        if(get(field.key) != undefined){ // if the signature's field field.key is present on the call
            // we push the field.key as string on the passedSignatureAttrs array
            req.passedSignatureAttrs.push(field.key);
            // we also push to filteredParams array on the key field.key a new object which has the value attribute
            // holding the value of the passed variable
            req.filteredParams[field.key] = {
                value: get(field.key)
            };

            if(field.goesWith != null && field.goesWith != undefined){
                for(var k=0; k<field.goesWith.length; k++){
                    if(get(field.goesWith[k]) == undefined){
                        reason.errors.push(field.key + ' can only be used along with ' + field.goesWith[k]);
                    }
                }
            }

            if(field.type === 'int'){
                if(!validator.isInt(get(field.key))){
                    reason.errors.push(field.key + ' must be an integer. ' + get(field.key) + ' provided.');
                } else {
                    if(!!field.min){
                        if(get(field.key) < field.min){
                            reason.errors.push(field.key + ' must be greater or equal to ' + field.min + '. ' + get(field.key) + ' provided.');
                        }
                    }
                    if(!!field.max){
                        if(get(field.key) > field.min){
                            reason.errors.push(field.key + ' must be lower or equal to ' + field.max + '. ' + get(field.key) + ' provided.');
                        }
                    }
                }
            } else if(field.type === 'date'){
                var momentObj = moment(get(field.key), field.validationString);
                if(!momentObj.isValid()){
                    reason.errors.push(field.key + ' must be a date in the format: '+ field.validationString +'. ' + get(field.key) + ' provided.');
                } else {
                    // in case of dates, for easiness we keep the momentObj representation of the passed variable, no matter
                    // which is the format of the date that we expect
                    req.filteredParams[field.key].momentObj = momentObj;
                }
            } else if(field.type === 'oneof'){
                if(field.acceptedValues.indexOf(get(field.key)) == -1){
                    reason.errors.push(field.key + ' must be one of ' + field.acceptedValues.join(', ') + '. ' + get(field.key) + ' provided.');
                }
            } else if(field.type === 'boolean'){
                if(get(field.key) !== true && get(field.key) !== false && get(field.key) !== 'true' && get(field.key) !== 'false'){
                    reason.errors.push(field.key + ' must be a boolean. ' + get(field.key) + ' provided.');
                }
            } else if(field.type == 'numeric'){
                if(!validator.isFloat(get(field.key))){
                    reason.errors.push(field.key + ' must be a number. ' + get(field.key) + ' provided.');
                }
            } else if(field.type === 'string'){
                if(!!field.minChars){
                    if(get(field.key).length < field.minChars){
                        reason.errors.push(field.key + ' must be of at least ' + field.minChars + ' long.' + get(field.key) + ' provided.');
                    }
                }
                if(!!field.maxChars){
                    if(get(field.key).length > field.maxChars){
                        reason.errors.push(field.key + ' must be of at max ' + field.maxChars + ' long.' + get(field.key) + ' provided.');
                    }
                }
            } else if(field.type == 'object'){
                
            }
        } else { // case field is not passed
            if(field.mandatory){
                reason.errors.push(field.key + ' is mandatory');
            } else if(field.hasOwnProperty('default')){
                set(field.key, field.default);
            }
        }
    }

    if(reason.errors.length > 0){
        return {
            passed: false,
            reason: reason
        }
    } else {
        return {
            passed: true
        }
    }
}



exports.validateAttrs = function(req, res, next){
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

        var validation = validate(currentNode[req.expressHappiness.apiMethod].fields, req);
        if(validation.passed){
            return next();
        } else{
            var err = new Error();
            err.type = 'invalidAttrs';
            err.details = validation.reason;
            return next(err);
        }

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