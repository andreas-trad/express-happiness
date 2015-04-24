/*
All routes might belong to none, one or more groups.
Grouping routes helps us apply middlewares targeting only specific sets of routes
Grouping routes follows waterfall inheritance model. A group assigned to a route is been inherited by default by
    all of its subroutes. For example:
    routes:{
        routeA:{
            groups:['groupA'],
            subRoutes:{
                routeB:{
                    // routeB by default belongs to 'groupA'
                }
            }
        }
    }
    we can always change the groups that groupB (or any other sub-route) belongs to by redefining the groups attribute
    for example if want routeB not to belong on groupA but to belong on groupB then we can do it by:
    routes:{
        routeA:{
            groups:['groupA'],
            subRoutes:{
                routeB:{
                    groups:['groupB']
                }
            }
        }
    }
    and if want groupB to belong on groups at all then an empty groups attribute would do it:
    routes:{
        routeA:{
            groups:[],
            subRoutes:{
                routeB:{
                    // routeB by default belongs to 'groupA'
                }
            }
        }
    }
 */


module.exports.conf = function(fieldsLoader){
    return {
        // API routes signatures
        routes:{
            kpis:{
                groups:['userAccess'],
                subRoutes: {
                    mytest: {
                        get: {
                            alias: 'mytest',
                            description: 'my test',
                            mock: false
                        }
                    },
                    traffic: {
                        get: {
                            alias: 'getTraffic',
                            description: 'Get the traffic',
                            fields: [
                                fieldsLoader.getField('orgId'),
                                fieldsLoader.getField('siteId'),
                                fieldsLoader.getField('locationId'),
                                fieldsLoader.getField('reportStartDate'),
                                fieldsLoader.getField('reportEndDate'),
                                fieldsLoader.getField('compareStartDate'),
                                fieldsLoader.getField('compareEndDate'),
                                fieldsLoader.getField('groupBy'),
                                fieldsLoader.getField('countType'),
                                fieldsLoader.getField('includeUnique'),
                                fieldsLoader.getField('includeReturning')
                            ]
                        }
                    }
                }
            }
        }
    }
};