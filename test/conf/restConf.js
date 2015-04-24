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
                subRoutes:{
                    traffic:
                    {
                        get:{
                            alias:'getTraffic',
                            description:'Get the traffic',
                            fields:[
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
                        },
                        subRoutes:{
                            powerHours: {
                                get:{
                                    description:'Get the traffic power hours',
                                    fields:[
                                        fieldsLoader.getField('orgId'),
                                        fieldsLoader.getField('siteId'),
                                        fieldsLoader.getField('reportStartDate'),
                                        fieldsLoader.getField('reportEndDate'),
                                        fieldsLoader.getField('countType'),
                                        fieldsLoader.getField('basePercentage')
                                    ]
                                }
                            }
                            ,entrances:{
                                get:{
                                    description:'Get the traffic monitoring point / quarter hour data',
                                    fields:[
                                        fieldsLoader.getField('orgId'),
                                        fieldsLoader.getField('siteId'),
                                        fieldsLoader.getField('reportStartDate'),
                                        fieldsLoader.getField('reportEndDate'),
                                        fieldsLoader.getField('countType'),
                                        fieldsLoader.getField('groupBy', {mandatory:true})
                                    ]
                                }
                            }
                        }
                    }
                    ,
                    dwellTime:{
                        get:{
                            description:'Get dwell time',
                            fields:[
                                fieldsLoader.getField('orgId'),
                                fieldsLoader.getField('siteId'),
                                fieldsLoader.getField('locationId'),
                                fieldsLoader.getField('reportStartDate'),
                                fieldsLoader.getField('reportEndDate'),
                                fieldsLoader.getField('compareStartDate'),
                                fieldsLoader.getField('compareEndDate'),
                                fieldsLoader.getField('groupBy'),
                                fieldsLoader.getField('includeDist'),
                                {
                                    key:'allLocations',
                                    type:'boolean',
                                    humanReadable: 'get massive report for all locations',
                                    description:'Get data for all locations of a given site but for each location separately',
                                    mandatory:false,
                                    default:false
                                }
                            ]
                        }
                    },
                    loyalty:{
                        get:{
                            description:'Get loyalty',
                            fields:[
                                fieldsLoader.getField('orgId'),
                                fieldsLoader.getField('siteId'),
                                fieldsLoader.getField('locationId'),
                                fieldsLoader.getField('reportStartDate'),
                                fieldsLoader.getField('reportEndDate'),
                                fieldsLoader.getField('compareStartDate', {mandatory:true}),
                                fieldsLoader.getField('compareEndDate', {mandatory:true}),
                                fieldsLoader.getField('type')
                            ]
                        }
                    },
                    grossShoppingHours:{
                        get:{
                            description:'Get gross shopping hours',
                            fields:[
                                fieldsLoader.getField('orgId'),
                                fieldsLoader.getField('siteId'),
                                fieldsLoader.getField('locationId'),
                                fieldsLoader.getField('reportStartDate'),
                                fieldsLoader.getField('reportEndDate'),
                                fieldsLoader.getField('compareStartDate'),
                                fieldsLoader.getField('compareEndDate'),
                                fieldsLoader.getField('groupBy'),
                                fieldsLoader.getField('includeUnique'),
                                fieldsLoader.getField('includeReturning')
                            ]
                        }
                    },
                    shoppersVsTravellers:{
                        get:{
                            description:'Get shoppers vs travellers',
                            fields:[
                                fieldsLoader.getField('orgId'),
                                fieldsLoader.getField('reportStartDate'),
                                fieldsLoader.getField('reportEndDate'),
                                fieldsLoader.getField('compareStartDate'),
                                fieldsLoader.getField('compareEndDate'),
                                fieldsLoader.getField('groupBy')
                            ]
                        }
                    },
                    abandonmentRate:{
                        get:{
                            description:'Get abandonment rates',
                            fields:[
                                fieldsLoader.getField('orgId'),
                                fieldsLoader.getField('siteId'),
                                fieldsLoader.getField('locationId'),
                                fieldsLoader.getField('reportStartDate'),
                                fieldsLoader.getField('reportEndDate'),
                                fieldsLoader.getField('compareStartDate'),
                                fieldsLoader.getField('compareEndDate'),
                                fieldsLoader.getField('groupBy')
                            ]
                        }
                    },
                    drawRate:{
                        get:{
                            description:'Get draw rate',
                            fields:[
                                fieldsLoader.getField('orgId'),
                                fieldsLoader.getField('siteId'),
                                fieldsLoader.getField('locationId'),
                                fieldsLoader.getField('reportStartDate'),
                                fieldsLoader.getField('reportEndDate'),
                                fieldsLoader.getField('compareStartDate'),
                                fieldsLoader.getField('compareEndDate'),
                                fieldsLoader.getField('groupBy')
                            ]
                        }
                    },
                    opportunity:{
                        get:{
                            description:'Get opportunity',
                            fields:[
                                fieldsLoader.getField('orgId'),
                                fieldsLoader.getField('siteId'),
                                fieldsLoader.getField('locationId'),
                                fieldsLoader.getField('reportStartDate'),
                                fieldsLoader.getField('reportEndDate'),
                                fieldsLoader.getField('compareStartDate'),
                                fieldsLoader.getField('compareEndDate'),
                                fieldsLoader.getField('groupBy')
                            ]
                        }
                    }
                }
            },
            auth: {
                post: {
                    description:'Authenticate user',
                    fields:[
                        fieldsLoader.getField('username'),
                        fieldsLoader.getField('user_password')
                    ]
                }
            },
            users:{
                groups:['superUserAccess'],
                get:{
                    description:'Get users',
                    fields:[]
                },
                post:{
                    description:'Post new user',
                    fields:[
                        fieldsLoader.getField('username'),
                        fieldsLoader.getField('user_password')
                    ]
                },
                subRoutes:{
                    ':user_id':{
                        get:{
                            description:'Get a specific user info',
                            fields:[]
                        },
                        put:{
                            description: 'Edit user\'s info',
                            fields:[
                                fieldsLoader.getField('user_password', {mandatory: false}),
                                fieldsLoader.getField('expired'),
                                fieldsLoader.getField('accessMap')
                            ]
                        },
                        delete:{
                            description: 'Delete user',
                            fields:[]
                        }
                    }
                }
            },
            organizations:{
                groups:['userAccess'],
                get:{
                    groups:[],  // the endpoint will check access to filter down org list
                    description:'Get organizations list',
                    fields:[]
                },
                post:{
                    groups:['superUserAccess'],
                    description:'Create a new organization',
                    fields:[
                        fieldsLoader.getField('orgId'),
                        fieldsLoader.getField('name')
                    ]
                },
                subRoutes:{
                    ':orgId':{
                        get:{
                            description: 'Organization\'s details',
                            fields:[]
                        },
                        put:{

                            description:'Edit organization\'s data',
                            fields:[
                                fieldsLoader.getField('name'),
                                fieldsLoader.getField('expired')
                            ]
                        },
                        delete:{

                            description: 'Delete organization',
                            fields:[]
                        },
                        subRoutes:{
                            users:{
                                groups:['orgAdmin'],
                                get:{
                                    description:'Get all users for which current user is an org admin',
                                    fields:[]
                                },
                                post:{
                                    description:'Add user to the current organization.  Create user if it does not exist.',
                                    fields:[
                                        fieldsLoader.getField('username'),
                                        fieldsLoader.getField('user_password', {mandatory: false})
                                    ]
                                },
                                subRoutes:{
                                    ':user_id':{
                                        get:{
                                            description:'get the user data, including access map. if user does not exist OR is not in org, return not found',
                                            fields:[]
                                        },
                                        put:{
                                            description:'update user data, including access map. if user does not exist OR is not in org, return not found',
                                            fields:[
                                                fieldsLoader.getField('user_password', {mandatory: false}),
                                                fieldsLoader.getField('expired'),
                                                fieldsLoader.getField('accessMap')
                                            ]
                                        },
                                        delete:{
                                            description:'remove user from organization. Never removes the user completely',
                                            fields:[]
                                        }
                                    }
                                }
                            },
                            sites:{
                                get:{
                                    description:'Get sites list',
                                    fields:[]
                                },
                                post:{

                                    description:'Create a new site',
                                    fields:[
                                        fieldsLoader.getField('siteId'),
                                        fieldsLoader.getField('name', {
                                            description:'Site name',
                                            humanReadable: 'Site name'
                                        }),
                                        fieldsLoader.getField('name', {
                                            key:'organization_name'
                                        }),
                                        fieldsLoader.getField('geo')
                                    ]
                                },
                                subRoutes:{
                                    ':siteId':{
                                        get:{
                                            description: 'Site\'s details',
                                            fields:[]
                                        },
                                        put:{

                                            description:'Edit site\'s data',
                                            fields:[
                                                fieldsLoader.getField('name', {
                                                    description:'Site name',
                                                    humanReadable: 'Site name'
                                                }),
                                                fieldsLoader.getField('name', {
                                                    key:'organization_name'
                                                }),
                                                fieldsLoader.getField('geo'),
                                                fieldsLoader.getField('expired')
                                            ]
                                        },
                                        delete:{

                                            description: 'Delete site',
                                            fields:[]
                                        },
                                        subRoutes:{
                                            locations:{
                                                get:{
                                                    description: 'Get site\'s locations',
                                                    fields:[]
                                                },
                                                post:{

                                                    description:'Create a new location',
                                                    fields:[
                                                        fieldsLoader.getField('location_id'),
                                                        fieldsLoader.getField('location_type'),
                                                        fieldsLoader.getField('name', {
                                                            key:'site_name',
                                                            description:'Site name',
                                                            humanReadable: 'Site name'
                                                        }),
                                                        fieldsLoader.getField('name', {
                                                            key:'organization_name',
                                                            description:'Organization name',
                                                            humanReadable: 'Organization name'
                                                        }),
                                                        fieldsLoader.getField('description'),
                                                        fieldsLoader.getField('beacon_id'),
                                                        fieldsLoader.getField('generic_other', {
                                                            key:'nested_set_left'
                                                        }),
                                                        fieldsLoader.getField('generic_other', {
                                                            key:'nested_set_right'
                                                        }),
                                                        fieldsLoader.getField('generic_other', {
                                                            key:'nested_set_depth'
                                                        }),
                                                        fieldsLoader.getField('traffic_monitoring_point_entrance_id'),
                                                        fieldsLoader.getField('traffic_monitoring_point_description')
                                                    ]
                                                },
                                                subRoutes:{
                                                    ':locationId':{
                                                        get:{
                                                            description: 'locations\'s details',
                                                            fields:[]
                                                        },
                                                        put:{

                                                            description:'Edit locations\'s data',
                                                            fields:[
                                                                fieldsLoader.getField('location_type'),
                                                                fieldsLoader.getField('name', {
                                                                    key:'site_name',
                                                                    description:'Site name',
                                                                    humanReadable: 'Site name'
                                                                }),
                                                                fieldsLoader.getField('name', {
                                                                    key:'organization_name',
                                                                    description:'Organization name',
                                                                    humanReadable: 'Organization name'
                                                                }),
                                                                fieldsLoader.getField('description'),
                                                                fieldsLoader.getField('beacon_id'),
                                                                fieldsLoader.getField('generic_other', {
                                                                    key:'nested_set_left'
                                                                }),
                                                                fieldsLoader.getField('generic_other', {
                                                                    key:'nested_set_right'
                                                                }),
                                                                fieldsLoader.getField('generic_other', {
                                                                    key:'nested_set_depth'
                                                                }),
                                                                fieldsLoader.getField('traffic_monitoring_point_entrance_id'),
                                                                fieldsLoader.getField('traffic_monitoring_point_description'),
                                                                fieldsLoader.getField('expired')
                                                            ]
                                                        },
                                                        delete:{

                                                            description: 'Delete locations',
                                                            fields:[]
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};