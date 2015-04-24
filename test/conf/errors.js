

exports.errors = {
    undefinedError:{
        log:false,
        humanReadable: 'Unresolved error code',
        sendToClient: {
            code:500,
            data: 'ErrCode: 1 - There was an error fulfilling your request at the moment. Please try again in a while'
        },
        hooks:[
            // here you can put whatever you want
        ]
    },
    '404':{
        log:true,
        sendToClient: {
            code:404,
            data:'Invalid route'
        }
    }
}