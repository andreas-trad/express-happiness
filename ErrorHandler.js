var ErrorHandler = function(logfileUrl){
    var logfile = require(logfileUrl);
    var fs = require('fs');
    var moment = require('moment');

    this.handleError = function(erObj, err, req, res){
        var toAppend = '\n' + moment().format('YYYY-MM-DD HH:mm:ss') + " | " + err.type + " | " + req.expressHappiness.apipath + ' | ' + erObj.humanReadable;
        if(err.details){
            toAppend += ' | ' + JSON.stringify(details);
        }

        fs.appendFile(logfile, toAppend, function (er) {
        });

        if(erObj.hooks != null && erObj.hooks != undefined){
            for(var i=0; i<erObj.hooks.length; i++){
                hooks[i](req, erObj, err);
            }
        }

        res.send(erObj.sendToClient.code || 200, erObj.sendToClient.data || '');
    };
}

module.exports = ErrorHandler;