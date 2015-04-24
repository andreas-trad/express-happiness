/*
 helper variable. It holds some commonly used required fields definitions to avoid redundancy on the requiredFields
 definition.
 The supported types are:
 - int (must be an integer)
 - date (must be a date in the format of the validationString
 - oneof (must be a one of the strings contained on the acceptedValues array)
 - boolean (must be boolean)
 - string (must be a string)
 - numeric (must be a number)
 - email (must be an email)
 */
module.exports = {
    orgId:{
        key:'orgId',
        type:'int',
        humanReadable: 'organization id',
        description:'The Organization from which data is requested',
        mandatory:true
    },
    testobj:{
        key:'testObj',
        type:'object',
        humanReadable:'my test obj',
        description:'here goes the desc',
        mandatory:true,
        keys:{
            alpha:{
                type:'array',
                mandatory:true
            },
            beta:{
                type:'oneof',
                acceptedValues:['day', 'week', 'month', 'year']
            },
            gamma:{
                type:'object',
                keys:{
                    gammaOne:{
                        mandatory:true,
                        type:'numeric'
                    },
                    gammaTwo:{
                        mandatory:false,
                        type:'numeric'
                    }
                }
            }
        }
    },
    reportStartDate:{
        key:'reportStartDate',
        type:'date',
        validationString:'YYYY-M-DTHH:mm:ssZ',
        humanReadable: 'report start date',
        description:'Required timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ Only report data starting at or after this time are returned',
        mandatory:true
    },
    reportEndDate:{
        key:'reportEndDate',
        type:'date',
        validationString:'YYYY-M-DTHH:mm:ssZ',
        humanReadable: 'report end date',
        description:'Required timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ Only report data at or before this time are returned',
        mandatory:true
    },
    compareStartDate:{
        key:'compareStartDate',
        type:'date',
        validationString:'YYYY-M-DTHH:mm:ssZ',
        humanReadable: 'compare start date',
        description:'Optional timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ Only compare data starting at or after this time are returned',
        mandatory:false
    },
    compareEndDate:{
        key:'compareEndDate',
        type:'date',
        validationString:'YYYY-M-DTHH:mm:ssZ',
        humanReadable: 'compare end date',
        description:'Optional timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ Only compare data at or before this time are returned',
        mandatory:false
    },
    groupBy:{
        key:'groupBy',
        type:'oneof',
        acceptedValues:['day', 'week', 'month', 'year'],
        humanReadable: 'grouping',
        description:'Optional string time period by which data will be grouped. Options include year, month, week, day, and hour. Defaults to week.',
        mandatory:false
    },
    includeDist:{
        key:'includeDist',
        type:'boolean',
        humanReadable: 'include visit distributions for each item',
        description:'Optional boolean defines whether temporal distributions are included for each item. Defaults to false',
        mandatory:false
    },
    includeUnique:{
        key:'includeUnique',
        type:'boolean',
        humanReadable: 'defines whether results include unique visitor counts',
        description:'PENDING - Optional boolean defines whether results include unique visitor counts. Defaults to false',
        mandatory:false
    },
    includeReturning:{
        key:'includeReturning',
        type:'boolean',
        humanReadable: 'defines whether results include unique visitor counts',
        description:'PENDING - Optional boolean defines whether results include returning visitor counts. Defaults to false',
        mandatory:false
    },
    countType:{
        key:'countType',
        type:'oneof',
        acceptedValues:['enters', 'exits'],
        humanReadable: 'defines if traffic results should be calculated using total exits or total enters',
        description:'Optional string defining whether traffic results are calculated using total_exits or total_enters. Options include enters and exits. Defaults to exits',
        mandatory:false
    },
    siteId: {
        key:'siteId',
        type:'int',
        humanReadable: 'site id',
        description:'The site id from which data is requested',
        mandatory:false
    },
    locationId: {
        key:'locationId',
        type:'int',
        humanReadable: 'location id',
        description:'The location from which data is requested',
        mandatory:false,
        goesWith:['siteId']
    },
    basePercentage: {
        key: 'basePercentage',
        type: 'numeric',
        humanReadable: 'power hours threshold',
        description: 'The percentage that must be exceeded to be labeled as a power hour',
        mandatory: true
    },
    type:{
        key:'type',
        type:'oneof',
        acceptedValues:['dstr','ave'], //TODO: refactor these to be clearer avg instead of ave...
        humanReadable: ' --- ',
        description:' --- ',
        mandatory:true
    },
    user_password:{
        key:'password',
        type:'string',
        humanReadable: 'The password of the user',
        description:'The password of the user',
        mandatory:true,
        minChars:4
    },
    username:{
        key:'username',
        type:'string',
        humanReadable: 'The login ID of the user',
        description:'The login ID of the user',
        mandatory:true,
        minChars:4
    },
    name:{
        key:'name',
        type:'string',
        humanReadable: 'The name of the organization',
        description:'The name of the organization',
        mandatory:false
    },
    expired:{
        key:'expired',
        type:'boolean',
        humanReadable: 'Expiration status',
        description:'The expiration status',
        mandatory:false
    },
    geo:{ //TODO: refactor to 'geometry'
        key:'geo',
        type:'geo',
        description:'Geo data',
        humanReadable:'Geo data',
        mandatory:false
    },
    location_type:{
        key:'location_type',
        type:'string',
        humanReadable:'The location type',
        description:'The location type',
        mandatory:true
    },
    description:{
        key:'description',
        type:'string',
        humanReadable:'Description',
        description:'Description',
        mandatory:true
    },
    beacon_id:{
        key:'beacon_id',
        type:'int',
        humanReadable:'Beacon id',
        description:'Beacon id',
        mandatory:false
    },
    generic_other:{
        description:'-',
        type:'other',
        mandatory:false
    },
    traffic_monitoring_point_entrance_id:{
        key:'traffic_monitoring_point_entrance_id',
        type:'int',
        mandatory:false,
        humanReadable:'Traffic monitoring point entrance id',
        description:'Traffic monitoring point entrance id'
    },
    traffic_monitoring_point_description:{
        key:'traffic_monitoring_point_description',
        type:'string',
        mandatory:false,
        humanReadable:'Traffic monitoring point description',
        description:'Traffic monitoring point description'
    },
    accessMap: {
        key: 'accessMap',
        type: 'other',
        mandatory: false,
        humanReadable: 'Access privileges for user',
        description: 'Access privileges for user'
    }
};