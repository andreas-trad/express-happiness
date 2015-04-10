var ErrorHandler = function(logfileUrl){
    var fs = require('fs');
    var moment = require('moment');

    this.handleError = function(erObj, err, req, res){
        var apipath = '';
        if(req.expressHappiness){
            apipath = req.expressHappiness.apipath;
        }

        var toAppend = '\n' + moment().format('YYYY-MM-DD HH:mm:ss') + " | " + err.type + " | " + apipath + ' | ' + erObj.humanReadable;
        if(err.details){
            toAppend += ' | ' + JSON.stringify(err.details);
        }

        if(erObj.log){
            fs.appendFile(logfileUrl, toAppend, function (er) {
            });
        }


        if(erObj.hooks != null && erObj.hooks != undefined){
            for(var i=0; i<erObj.hooks.length; i++){
                hooks[i](req, erObj, err);
            }
        }

        if(erObj.sendToClient){
            if(erObj.sendToClient.data){
                if(erObj.sendToClient.data === 'err.details'){
                    erObj.sendToClient.data = err.details;
                }
            }
        }
        res.status(erObj.sendToClient.code || 200).send(erObj.sendToClient.data || '');
    };
}

module.exports = ErrorHandler;