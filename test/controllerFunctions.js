var functions = [];

functions['getTraffic'] = function(req, res){
    console.log('got in here');
    res.send({a:'b'});
}

exports.functions = functions;
