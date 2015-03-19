module.exports = function(reusableFile){
    var reusableRequiredFields = require(reusableFile);

    /*
     Returns the corresponding field object from the reusableRequiredFields variable

     @name: the name of the field
     @options: optionally pass an options object. All keys of this object will be used to overwrite the default values
     of the the corresponding keys of the original field definition.

     Example:
     getField('orgId')
     Returns:
     {
     key:'orgId',
     type:'int',
     humanReadable: 'organization id',
     description:'The Organization from which data is requested',
     mandatory:true
     }

     getField('orgId', {mandatory:false});
     Returns:
     {
     key:'orgId',
     type:'int',
     humanReadable: 'organization id',
     description:'The Organization from which data is requested',
     mandatory:false
     }
     */
    this.getField = function(name, options){
        if(!reusableRequiredFields[name]){
            console.log('The requested field ' + name + ' does not exist on the reusableRequiredFields object');
            return {
                key:'invalid_key'
            };
        } else {
            var toReturn = JSON.parse(JSON.stringify(reusableRequiredFields[name]));
            if(!!options){
                var keys = Object.keys(options);
                for(var i=0; i<keys.length; i++){
                    var key = keys[i];
                    toReturn[key] = options[key];
                }
            }
            return toReturn;
        }
    }
}