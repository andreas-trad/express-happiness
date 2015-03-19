var dbm = require('./../controllers/dbMiddleware.js');
var erH = require('./../controllers/ErrorHandler.js');

var functions = [];
var credentialsChecker = require('./../controllers/CredentialsChecker.js');

functions['get:/kpis/traffic'] = function (req, res) {
    var request = queryCheck(req);

    switch (request.type) {
        case 'compare':
            var query = {
                text: "SELECT a.organization_id, a.period_start_date, b.period_start_date compare_start_date, a.total_traffic, b.total_traffic total_traffic_compare " +
                "FROM ( " +
                "SELECT a.organization_id, date_trunc(:groupBy" +
                ", period_start_date) period_start_date, " +
                "rank() over (order by date_trunc(:groupBy" +
                ", period_start_date)) period_rank, " +
                "sum(DECODE(:countType, 'X', total_exits, 'E', total_enters)) total_traffic " +
                "FROM dw_perimeter_analytics.site_hourly a, (" +
                "SELECT site_id from dw_perimeter_analytics.site " +
                "WHERE organization_id = :orgId " +
                "AND min_traffic_date <= :compareStartDate " +
                "AND nvl(end_date, '9999-12-31') >= :reportEndDate " +
                ") b " +
                "WHERE a.organization_id = :orgId " +
                "AND a.period_start_date >= :reportStartDate " +
                "AND a.period_start_date < :reportEndDate + 1 " +
                "AND a.site_id = b.site_id " +
                "GROUP BY a.organization_id, date_trunc(:groupBy, period_start_date) " +
                ") a, ( " +
                "SELECT a.organization_id, date_trunc(:groupBy, period_start_date) " +
                "period_start_date, rank() over (order by date_trunc(:groupBy, " +
                "period_start_date)) period_rank, sum(DECODE(:countType, 'X', total_exits, 'E', total_enters)) total_traffic " +
                "FROM dw_perimeter_analytics.site_hourly a, (" +
                "SELECT site_id " +
                "FROM dw_perimeter_analytics.site " +
                "WHERE organization_id = :orgId " +
                "AND min_traffic_date <= :compareStartDate " +
                "AND nvl(end_date, '9999-12-31') >= :reportEndDate) " +
                "b " +
                "WHERE a.organization_id = :orgId " +
                "AND a.period_start_date >= :compareStartDate " +
                "AND a.period_start_date < :compareEndDate + 1 " +
                "AND a.site_id = b.site_id " +
                "GROUP BY a.organization_id, date_trunc(:groupBy, period_start_date) ) b " +
                "WHERE b.period_rank = a.period_rank",
                values: {
                    groupBy: request.groupBy,
                    countType: request.countType,
                    orgId: request.orgId,
                    compareStartDate: request.compareStartDate,
                    reportEndDate: request.reportEndDate,
                    reportStartDate: request.reportStartDate,
                    compareEndDate: request.compareEndDate
                }
            };

            dbm.makeRawQuery(query, req,
                function (results) {
                    res.json({success: true, result: results, total: results.length});
                },
                function (errObj) {
                    res.json({success: false, reason: errObj.sendToClient});
                }
            );

            break;
        case 'report':

            if(!req.param('locationId')) { // traffic from dw_perimeter_analytics.site_hourly
                var query = {
                    attributes: [
                        'organization_id'
                        , [dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('period_start_date')), 'period_start_date']
                        , [dbm.sequelize.fn('SUM', dbm.sequelize.fn('DECODE', request.countType, 'X', dbm.sequelize.col('total_exits'), 'E', dbm.sequelize.col('total_enters'))), 'total_traffic']
                    ],
                    where: {
                        period_start_date: {
                            between: [request.reportStartDate, request.reportEndDate]
                        },
                        organization_id: request.orgId
                    },
                    group: ['organization_id', dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('period_start_date'))],
                    order: [dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('period_start_date'))]
                };

                dbm.makeQuery('site_hourly', addSiteIdAndLocation(req, query), req,
                    function (results) {
                        res.json({success: true, result: results, total: results.length});
                    },
                    function (errObj) {
                        res.json({success: false, reason: errObj.sendToClient});
                    }
                );
            } else { // traffic from dw_mobile_analytics.kpi_daily_2
                var query = {
                    text: "SELECT org_id, site_id, location_id, date_trunc(:groupBy, \"timestamp\") period_start_date, SUM(ROUND(kpi_traffic)) total_traffic " +
                        "FROM dw_mobile_analytics.kpi_daily_2 " +
                        "WHERE org_id = :orgId " +
                        "AND location_id = :location_id " +
                        "AND \"timestamp\" >= :reportStartDate " +
                        "AND \"timestamp\" < :reportEndDate " +
                        "AND timestamp <= sysdate " +
                        "GROUP BY org_id, site_id, location_id, date_trunc(:groupBy, \"timestamp\") " +
                        "ORDER BY date_trunc(:groupBy, \"timestamp\")"
                    ,values: {
                        groupBy: request.groupBy,
                        orgId: request.orgId,
                        location_id: req.param('locationId'),
                        reportStartDate: request.reportStartDate,
                        reportEndDate: request.reportEndDate
                    }
                };

                dbm.makeRawQuery(query, req,
                    function (results) {
                        res.json({success: true, result: results, total: results.length});
                    },
                    function (errObj) {
                        res.json({success: false, reason: errObj.sendToClient});
                    }
                );


                // var query = {
                //     attributes: [
                //         'org_id'
                //         , [dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp')), 'period_start_date']
                //         , [dbm.sequelize.fn('SUM', dbm.sequelize.col('kpi_traffic')), 'total_traffic']

                //     ],
                //     where: {
                //         timestamp: {
                //             between: [request.reportStartDate, request.reportEndDate]
                //         },
                //         org_id: request.orgId
                //     },
                //     group: ['org_id', dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))],
                //     order: [dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))]
                // };

                // dbm.makeQuery('kpi_daily_2', addSiteIdAndLocation(req, query), req,
                //     function (results) {
                //         res.json({success: true, result: results, total: results.length});
                //     },
                //     function (errObj) {
                //         res.json({success: false, reason: errObj.sendToClient});
                //     }
                // );
            }

            break;
        default:
            var error = erH.handleError('NO_ORGID', {url: req.url});
            res.json({success: false, reason: error.sendToClient});
            break
    }
};


functions['get:/kpis/dwellTime'] = function (req, res) {
    var request = queryCheck(req);

    //console.log(request.allLocations);
    if(!request.allLocations){
        var query = {
            attributes: [
                'org_id'
                ,[dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp')), 'period_start_date']
                ,[dbm.sequelize.literal('SUM(kpi_gsh * 60) / SUM(kpi_traffic)'), 'average_dwelltime']
            ],
            where: {
                timestamp: {
                    between: [request.reportStartDate, request.reportEndDate]
                },
                org_id: request.orgId
            },
            group:['org_id', dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))],
            order: [dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))]
        };


        dbm.makeQuery('kpi_daily_2', addSiteIdAndLocation(req, query), req,
            function(results){
                res.json({success:true, result:results, total: results.length});
            },
            function(errObj){
                res.json({success:false, reason:errObj.sendToClient});
            }
        );
    } else {
        // step 1. Find all the locations of the provided siteId that the user has access to
        var query = {
            attributes: [
                'org_id'
                ,'site_id'
                ,'location_id'
                ,[dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp')), 'period_start_date']
                ,[dbm.sequelize.literal('SUM(kpi_gsh * 60) / SUM(kpi_traffic)'), 'average_dwelltime']
            ],
            where: {
                timestamp: {
                    between: [request.reportStartDate, request.reportEndDate]
                },
                org_id: request.orgId
            },
            group:['org_id', 'site_id', 'location_id', dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))],
            order: ['location_id', dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))]
        };


        dbm.makeQuery('kpi_daily_2', filterOutLocationsBasedOnUserAccessMap(req, query), req,
            function(results){
                res.json({success:true, result:results, total: results.length});
            },
            function(errObj){
                res.json({success:false, reason:errObj.sendToClient});
            }
        );

        // step 2. Construct the query
        // step 3. Execute the query
    }
};

functions['get:/kpis/loyalty'] = function (req, res) {

    if(req.param('locationId')){
        var urlToRequest = 'http://10.32.10.191:8181/loyalty?locId=' + req.filteredParams['locationId'].value + '&startDate=' + req.filteredParams['reportStartDate'].momentObj.format('YYYYMMDD') + '&endDate=' + req.filteredParams['reportEndDate'].momentObj.format('YYYYMMDD') + '&compareStartDate=' + req.filteredParams['compareStartDate'].momentObj.format('YYYYMMDD') + '&compareEndDate=' + req.filteredParams['compareEndDate'].momentObj.format('YYYYMMDD') + '&type=' + req.param('type');
    } else {
        var urlToRequest = 'http://10.32.10.191:8181/loyalty?siteId=' + req.filteredParams['siteId'].value + '&startDate=' + req.filteredParams['reportStartDate'].momentObj.format('YYYYMMDD') + '&endDate=' + req.filteredParams['reportEndDate'].momentObj.format('YYYYMMDD') + '&compareStartDate=' + req.filteredParams['compareStartDate'].momentObj.format('YYYYMMDD') + '&compareEndDate=' + req.filteredParams['compareEndDate'].momentObj.format('YYYYMMDD') + '&type=' + req.param('type');
    }

    var request = require('request');
    request({url: urlToRequest, timeout: 15000}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(JSON.parse(body));
        } else {
            //console.log(error);
            var erObj = erH.handleError('PASS_THROUGH_ERROR', {request: 'loyalty', error: error, response: response});
            res.json({
                success: false,
                details: erObj.sendToClient
            });
        }
    });
};

functions['get:/kpis/grossShoppingHours'] = function (req, res) {
    var request = queryCheck(req);

    var query = {
        attributes: [
            'org_id'
            , [dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp')), 'period_start_date']
            , [dbm.sequelize.fn('SUM', dbm.sequelize.col('kpi_gsh')), 'gross_shopping_hours']
        ],
        where: {
            timestamp: {
                between: [request.reportStartDate, request.reportEndDate]
            },
            org_id: request.orgId
        },
        group: ['org_id', dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))],
        order: [dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))]
    };
    dbm.makeQuery('kpi_daily_2', addSiteIdAndLocation(req, query), req,
         function(results){
             res.json({success:true, result:results, total: results.length});
         },
         function(errObj){
             res.json({success:false, reason:errObj.sendToClient});
         }
    );
};

functions['get:/kpis/shoppersVsTravellers'] = function (req, res) {
    /* TODO
     Create the query to reteive the data
     */
    var query = '.';

    dbm.makeQuery('kpi_daily_2', addSiteIdAndLocation(req, query), req,
        function (results) {
            res.json({success: true, result: results, total: results.length});
        },
        function (errObj) {
            res.json({success: false, reason: errObj.sendToClient});
        }
    );
};

functions['get:/kpis/abandonmentRate'] = function (req, res) {
    var request = queryCheck(req);

    var query = {
       attributes: [
         'org_id'
         ,[dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp')), 'period_start_date']
         ,[dbm.sequelize.literal('SUM(kpi_traffic * kpi_abandonment_rate) / SUM(kpi_traffic)'), 'average_abandonment_rate']
       ],
       where: {
         timestamp: {
           between: [request.reportStartDate, request.reportEndDate]
         },
         org_id: request.orgId
       },
       group:['org_id', dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))],
       order: [dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))]
    };

    dbm.makeQuery('kpi_daily_2', addSiteIdAndLocation(req, query), req,
       function(results){
         res.json({success:true, result:results, total: results.length});
       },
       function(errObj){
         res.json({success:false, reason:errObj.sendToClient});
       }
    );
};

functions['get:/kpis/drawRate'] = function (req, res) {
    var request = queryCheck(req);

    var query = {
        attributes: [
            'org_id'
            ,[dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp')), 'period_start_date']
            ,[dbm.sequelize.literal('SUM(kpi_traffic) / SUM(kpi_opportunity)'), 'average_draw_rate']
        ],
        where: {
            timestamp: {
                between: [request.reportStartDate, request.reportEndDate]
            },
            org_id: request.orgId
        },
        group:['org_id', dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))],
        order: [dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))]
    };


    dbm.makeQuery('kpi_daily_2', addSiteIdAndLocation(req, query), req,
        function(results){
            res.json({success:true, result:results, total: results.length});
        },
        function(errObj){
            res.json({success:false, reason:errObj.sendToClient});
        }
    );
};


functions['get:/kpis/opportunity'] = function (req, res) {
    var request = queryCheck(req);

    var query = {
        attributes: [
            'org_id'
            , [dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp')), 'period_start_date']
            , [dbm.sequelize.fn('ROUND', dbm.sequelize.fn('SUM', dbm.sequelize.col('kpi_opportunity'))), 'total_opportunity']  // ROUND(SUM(kpi_opportunity),0). I removed the zero
        ],
        where: {
            timestamp: {
                between: [request.reportStartDate, request.reportEndDate]
            },
            org_id: request.orgId
        },
        group: ['org_id', dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))],
        order: [dbm.sequelize.fn('date_trunc', request.groupBy, dbm.sequelize.col('timestamp'))]
    };

    dbm.makeQuery('kpi_daily_2', addSiteIdAndLocation(req, query), req,
        function (results) {
            res.json({success: true, result: results, total: results.length});
        },
        function (errObj) {
            res.json({success: false, reason: errObj.sendToClient});
        }
    );
};


functions['get:/kpis/traffic/powerHours'] = function (req, res) {
    var siteId = null;
    var replacementJSON = {
        siteId: '',
        siteIdCriterion: ''
    };
    if (!!req.param('siteId')) {
        siteId = req.param('siteId');
        replacementJSON = {
            siteId: 'site_id,',
            siteIdCriterion: 'AND site_id=:siteId '
        };
    }

    var text = "SELECT organization_id, <%= siteId %> period_start_date, to_char(period_start_date, 'Dy') dow_name, total_traffic," +
        " DECODE(total_traffic_period, 0, 0, " +
        " (total_traffic / total_traffic_period :: real) * 100) period_traffic_percent," +
        " CASE " +
        " WHEN DECODE(total_traffic_period, 0, 0, " +
        " (total_traffic / total_traffic_period :: real) * 100) > :basePercentage THEN true" +
        " ELSE false" +
        " END power_hour_ind" +
        " FROM (" +
        " SELECT organization_id,  <%= siteId %> period_start_date," +
        " sum(DECODE(:countType, 'E', total_enters, 'X', total_exits)) total_traffic," +
        " sum(sum(total_exits)) over () total_traffic_period" +
        " FROM dw_perimeter_analytics.site_hourly" +
        " WHERE organization_id = :orgId" +
        " <%= siteIdCriterion %>" +
        " AND period_start_date >= :reportStartDate" +
        " AND period_start_date <  :reportEndDate" +
        " GROUP BY organization_id, <%= siteId %> period_start_date" +
        " )" +
        " ORDER BY period_start_date";

    var _ = require('underscore');
    var tpl = _.template(text);
    text = tpl(replacementJSON);

    var query = {
        text: text,
        values: {
            siteId: siteId,
            orgId: req.param('orgId'),
            reportStartDate: req.param('reportStartDate'),
            reportEndDate: req.param('reportEndDate'),
            countType: req.param('countType') == 'E' ? 'E' : 'X',
            basePercentage: req.param('basePercentage')
        }
    };

    dbm.makeRawQuery(query, req,
        function (results) {
            res.json({success: true, result: results, total: results.length});
        },
        function (errObj) {
            res.json({success: false, reason: errObj.sendToClient});
        }
    );

};

functions['get:/kpis/traffic/entrances'] = function (req, res) {
    var countType = 'X';
    if (req.param('countType')) {
        if (req.param('countType') === 'enters') {
            countType = 'E';
        }
    }

    var query = {
        attributes: [
            'organization_id'
            , 'monitor_point_id'
            , [dbm.sequelize.fn('date_trunc', req.param('groupBy'), dbm.sequelize.col('period_start_date')), 'period_start_date']
            , [dbm.sequelize.fn('SUM', dbm.sequelize.fn('DECODE', countType, 'X', dbm.sequelize.col('total_exits'), 'E', dbm.sequelize.col('total_enters'))), 'total_traffic']  // ROUND(SUM(kpi_opportunity),0). I removed the zero
        ],
        where: {
            period_start_date: {
                between: [req.param('reportStartDate'), req.param('reportEndDate')]
            },
            organization_id: req.param('orgId')
        },
        group: ['organization_id', 'monitor_point_id', dbm.sequelize.fn('date_trunc', req.param('groupBy'), dbm.sequelize.col('period_start_date'))],
        order: [dbm.sequelize.fn('date_trunc', req.param('groupBy'), dbm.sequelize.col('period_start_date'))]
    };

    dbm.makeQuery('monitor_point_15min', addSiteIdAndLocation(req, query), req,
        function (results) {
            res.json({success: true, result: results, total: results.length});
        },
        function (errObj) {
            res.json({success: false, reason: errObj.sendToClient});
        }
    );
};

var userController = require('./../controllers/user.js');
functions['get:/users'] = userController.getUsers;
functions['post:/users'] = userController.postUser;
functions['get:/users/:user_id'] = userController.getUser;
functions['put:/users/:user_id'] = userController.putUser;
functions['delete:/users/:user_id'] = userController.deleteUser;

functions['get:/organizations/:orgId/users'] = userController.getOrgUsers;
functions['post:/organizations/:orgId/users'] = userController.postOrgUser;
functions['get:/organizations/:orgId/users/:user_id'] = userController.getOrgUser;
functions['put:/organizations/:orgId/users/:user_id'] = userController.putOrgUser;
functions['delete:/organizations/:orgId/users/:user_id'] = userController.deleteOrgUser;

var organizationController = require('./../controllers/organization.js');
functions['get:/organizations'] = organizationController.getOrganizations;
functions['post:/organizations'] = organizationController.postOrganization;
functions['get:/organizations/:orgId'] = organizationController.getOrganization;
functions['put:/organizations/:orgId'] = organizationController.putOrganization;
functions['delete:/organizations/:orgId'] = organizationController.deleteOrganization;

var siteController = require('./../controllers/site.js');
functions['get:/organizations/:orgId/sites'] = siteController.getSites;
functions['post:/organizations/:orgId/sites'] = siteController.postSite;
functions['get:/organizations/:orgId/sites/:siteId'] = siteController.getSite;
functions['put:/organizations/:orgId/sites/:siteId'] = siteController.putSite;
functions['delete:/organizations/:orgId/sites/:siteId'] = siteController.deleteSite;

var locationController = require('./../controllers/location.js');
functions['get:/organizations/:orgId/sites/:siteId/locations'] = locationController.getLocations;
functions['post:/organizations/:orgId/sites/:siteId/locations'] = locationController.postLocation;
functions['get:/organizations/:orgId/sites/:siteId/locations/:locationId'] = locationController.getLocation;
functions['put:/organizations/:orgId/sites/:siteId/locations/:locationId'] = locationController.putLocation;
functions['delete:/organizations/:orgId/sites/:siteId/locations/:locationId'] = locationController.deleteLocation;

var authController = require('./../controllers/auth.js');
functions['post:/auth'] = authController.postAuth;


//functions['/kpis/mallUse']
//functions['/kpis/areaUse']
//functions['/kpis/visitFrequency']
//functions['/kpis/routes']


exports.functions = functions;


function queryCheck(req) {
    //DEFAULTS
    var allLocations = false;
    var groupBy = 'week';
    var countType = 'X';

    if(req.param('allLocations')){
        if(req.param('allLocations') == true || req.param('allLocations') === 'true'){
            allLocations = true;
        }
    }

    if (req.param('groupBy')) {
        groupBy = req.param('groupBy');
    }

    if (req.param('countType')) {
        if (req.param('countType') === 'enters') {
            countType = 'E';
        }
    }
    if (req.param('orgId')
        && req.param('reportStartDate')  // compare data
        && req.param('reportEndDate')
        && req.param('compareStartDate')
        && req.param('compareEndDate')) {
        return {
            type: 'compare',
            orgId: req.param('orgId'),
            countType: countType,
            reportStartDate: req.param('reportStartDate'),
            reportEndDate: req.param('reportEndDate'),
            compareStartDate: req.param('compareStartDate'),
            compareEndDate: req.param('compareEndDate'),
            groupBy: groupBy,
            mock: req.param('mock')
        };
    } else if (req.param('orgId')
        && req.param('reportStartDate') // report period only
        && req.param('reportEndDate')) {
        return {
            type: 'report',
            orgId: req.param('orgId'),
            countType: countType,
            reportStartDate: req.param('reportStartDate'),
            reportEndDate: req.param('reportEndDate'),
            groupBy: groupBy,
            mock: req.param('mock'),
            allLocations: allLocations
        };
    } else { // fail
        return {type: '', message: ''};
    }
};


function addSiteIdAndLocation(req, query) {
    if (req.param('siteId') != null && req.param('siteId') != undefined && req.passedSignatureAttrs.indexOf('siteId') >= 0) {
        query.where.site_id = req.param('siteId');
        query.attributes.push('site_id');
        query.group.push('site_id');
    }

    if (req.param('locationId') != null && req.param('locationId') != undefined && req.passedSignatureAttrs.indexOf('locationId') >= 0) {
        query.where.location_id = req.param('locationId');
        query.attributes.push('location_id');
        query.group.push('location_id');
    }

    return query;
}

function filterOutLocationsBasedOnUserAccessMap(req, query){
    var orgId = req.param('orgId');
    var siteId = req.param('siteId');
    var lastKnownPrivs = {};
    var locations = {};

    var accessMapRoot = req.user.accessMap.organizations;

    if (accessMapRoot.hasOwnProperty(orgId)) {
        if (accessMapRoot[orgId].hasOwnProperty('children_general_rule')) {
            lastKnownPrivs = accessMapRoot[orgId].children_general_rule;
        } else if (accessMapRoot[orgId].hasOwnProperty('access')) {
            lastKnownPrivs = accessMapRoot[orgId].access;
        }
        if (accessMapRoot[orgId].hasOwnProperty('sites')) {
            if (accessMapRoot[orgId].sites.hasOwnProperty('children_general_rule')) {
                lastKnownPrivs = accessMapRoot[orgId].sites.children_general_rule;
            } else if (accessMapRoot[orgId].sites.hasOwnProperty('access')){
                lastKnownPrivs = accessMapRoot[orgId].sites.access;
            }
            if (accessMapRoot[orgId].sites.hasOwnProperty(siteId)) {
                if (accessMapRoot[orgId].sites[siteId].hasOwnProperty('children_general_rule')){
                    lastKnownPrivs = accessMapRoot[orgId].sites[siteId].children_general_rule;
                } else if (accessMapRoot[orgId].sites[siteId].hasOwnProperty('access')){
                    lastKnownPrivs = accessMapRoot[orgId].sites[siteId].access;
                }
                if (accessMapRoot[orgId].sites[siteId].hasOwnProperty('locations')) {
                    locations = accessMapRoot[orgId].sites[siteId].locations;
                }
            }
        }
    }

    var operation = 'exclude';
    if(lastKnownPrivs.hasOwnProperty('get')){
        if(Object.keys(locations).length == 0){
            return query;
        }
    } else {
        if(Object.keys(locations).length == 0){
            query.where.location_id = '-1';
            return query;
        } else {
            operation = 'include';
        }
    }

    var exceptionLocations = [];
    for(key in locations){
        if(locations.hasOwnProperty(key)){
            if(operation === 'include'){
                if(locations[key].hasOwnProperty('access')){
                    if(locations[key].access.hasOwnProperty('get')){
                        if(locations[key].access.get === true){
                            exceptionLocations.push(key);
                        }
                    }
                }
            } else { // excluding locations
                if(locations[key].hasOwnProperty('access')){
                    if(!locations[key].access.hasOwnProperty('get')){
                        exceptionLocations.push(key);
                    } else {
                        if(locations[key].access.get != false){
                            exceptionLocations.push(key);
                        }
                    }
                }
            }
        }
    }

    if(operation === 'include'){
        query.where.location_id = {in: exceptionLocations};
    } else {
        query.where.location_id = {not: exceptionLocations};
    }

    return query;
}