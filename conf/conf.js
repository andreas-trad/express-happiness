var path = require('path');

exports.conf = {
    errorLogFile: path.resolve(__dirname, '../') + '/logs/error.log',
    mockOperations:{
        "get:/kpis/traffic":false,
        "get:/kpis/traffic/powerHours": false,
        "get:/kpis/traffic/entrances":false,
        "get:/kpis/dwellTime":false,
        "get:/kpis/loyalty":false,
        "get:/kpis/grossShoppingHours":false,
        "get:/kpis/shoppersVsTravellers":true,
        "get:/kpis/mallUse":true,
        "get:/kpis/areaUse":true,
        "get:/kpis/visitFrequency":true,
        "get:/kpis/abandonmentRate":false,
        "get:/kpis/drawRate":false,
        "get:/kpis/opportunity":false,
        "get:/kpis/hierarchy": true,
        "get:/sites/:site_id/locations": false
    },
    jwtSecret: 'N##$%W$&SFGHY$$^#W#%YLK"HBH4l5hjhbkdsljly5%$elawkjgy3%Y4foijfAWT$QTJQALDGKSDJFY$%L^KJ%^'
};
