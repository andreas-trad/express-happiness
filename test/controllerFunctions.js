var functions = [];

functions['getTraffic'] = function(req, res){
    console.log('got in here');
    res.send({a:'b'});
}

functions['mytest'] = function(req, res){
    console.log('ok');
    res.send({route:'my test'});
}

exports.functions = functions;
