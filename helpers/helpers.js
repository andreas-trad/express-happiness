var validate = function(obj, func, callback) {
    var index = 0;
    var done = false;
    var iterations = Object.keys(obj).length;
    var objKeys = Object.keys(obj);
    console.log('got into validate');
    console.log('Number of keys: ' + iterations);
    var loop = {
        next: function() {
            if (done) {
                return;
            }

            if (index < iterations) {
                var self = this;
                unitValidate(obj[objKeys[index]], function(){
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


var unitValidate = function(unit, callback){
    console.log('unit: ');
    console.log(unit);
    if(typeof unit === 'object'){
        console.log('unit is object')
        validate(unit, function(loop){
            loop.next();
        }, callback)
    } else {
        console.log('unit is primitive');
        console.log('validating unit');
        callback();
    }
};

var obj = {
    a:4,
    b:'test',
    c:{
        ca:'ca',
        cb:4,
        d:{
            da:'abc',
            db:1412
        }
    }
}

unitValidate(obj, function() {
        console.log('done');
    }
);