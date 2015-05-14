<h1>Express Happiness</h1>
===========================

<h2>Intro</h2>
ExpressHappiness is a reach framework for creating web apps and services, built on top of 
<a href="http://expressjs.com/" target="_blank">express framework</a>.<br/>
We all use and love express. When it comes to large and complex apps, some times the 
maintainability of them becomes hard as we keep on adding routes, handle errors and permissions.<br/>
ExpressHappiness provides a way to develop robust and maintainable apps or REST APIs using express.<br/>
The main features of the framework are the above:
<ul>
<li>the full routes tree is defined in a single object, in a JSON-like manner</li>
<li>error handling is defined in the exact same manner in a single file. You can either define your own error codes, define the way that they'll be handled on the errors configuration file
 and trigger them any time from any part of your code and letting the framework handle them the way you define</li>
<li>define permissions to each route by specifying the access group(s) that each route belongs to and define middlewares for groups of routes, not for each route separately</li>
<li>validate the params of each call by defining their characteristics on the routes definition file</li>
<li>automatically generate your rest api documentation</li>
<li>work with mock data, by just putting a file on specific folder and set mock parameter to true on the route's definition</li>
<li>put function hooks to any error type</li>
<li>and many more...</li>
</ul>

<h2>Install</h2>
<code>
$ npm install express-happiness
</code>

<h2>The basics / Structure</h2>
Every ExpressHappiness project consists of a specific set of files that define the project's routes and behaviour.
These files are:
<ul>
<li><b>Routes Tree Configuration</b>: On this file you'll put / define all
of the supported routes of your app with all of their details. These details include the method of the route
(get / post / put / delete), the parameters of the route (parameter type, validation rules) and you can also enable / disable
the mock operation.<br/>
For each route you can define an alias name and also the group(s) that this route belongs to. The "groups" that the
routes belong to are custom groups, with custom names. The groups that a route belongs to define the middlewares that
will be applied to it. More details about grouping and group-specific middlewares will be defined later on.
</li>
<li><b>Reusable Params File</b>: There are cases where many routes have the exact same parameter, with the
 exact same type and validation rules. In order to avoid rewriting the same parameter definition again and
 again throughout all of these routes you can define these params once and just reuse them to any of the routes. The file
 that holds the "reusable params" definitions is the Reusable Params File.
 These type of parameters are called "reusable" params and are defined on the Reusable Fields File</li>
<li><b>Error Handling Configuration File</b>: At any point of the middlewares chain of any call you can
 trigger errors. Errors of custom types, decorated with custom details. Express Happiness provides an error handling
 mechanism that automatically takes care this errors. The way each custom type's error will be handled is defined on this file.
 The developer has the ability to define whether and what is going to be written to the error.log file,
 what code should be sent back to the client (200, 400, 401, etc) and what data will be served. Finally, on each of these
 error types, the developers can define a set of hook functions to be executed (email send, log to db, whatever).<br/>
 All these error handling parameters are defined on the Error Handling Configuration File.</li>
<li><b>error log</b>: Is just a plain text file holding all logs printed out by the Error Handling mechanism</li>
<li><b>Controller Functions</b>: This file defines the function that should be executed on each route.
 The main concept here is not to define / write the body of these functions within this file but to have a "mapper"
 endpoint though which anyone can easily find out what's going on, on any route.<br/>
 The association between routes and controller functions is done by an associative array,
 each key of which is a string, either the full route definition or the route alias and each value the corresponding controller function.
 As mentioned, routes' aliases can be defined on the Routes Tree Configuration File.</li>
</ul>

<h2>Starting with it</h2>
In order to start, you can just clone <a href="#" target="_blank">this repo</a> to your machine or either follow step
 by step this document.
<h3>Create your Reusable Params File</h3>
Each route expects for some params to be passed on call. As mentioned, Express Happiness includes an automatic params
validation mechanism and the only thing you should do is to define the params and the validation rules that apply for
each route. <br/>
Each parameter, no matter its type, has the following structure:<br/>
<p>Code Snippet 1. <b>Parameter's basic structure</b></p>
<pre lang="javascript"><code>
param: {
    "key": "the-key-name",
    "type": "one-of-the-supported-types",
    "humanReadable": "short title of the param",
    "description": "A human-readable description of the parameter",
    "mandatory": "boolean-true-or-false"
}
</code></pre>
<br/>
Not all of these characteristics are mandatory nor are they all. For each parameter type, special characteristics apply.
For example, for type "int", the definition object of the param may (optionally) include "min" and "max" keys, etc.<br/>
<br/><b>The list of the supported parameter types is:</b>
<p>Table 1. <b>Supported parameter types</b></p>
<table>
<tr>
<td>int</td>
<td>Integer</td>
</tr>
<tr>
<td>date</td>
<td>Date</td>
</tr>
<tr>
<td>oneof</td>
<td>The value must be one of the specified</td>
</tr>
<tr>
<td>boolean</td>
<td>Boolean</td>
</tr>
<tr>
<td>numeric</td>
<td>any number</td>
</tr>
<tr>
<td>string</td>
<td>String</td>
</tr>
<tr>
<td>array</td>
<td>Array</td>
</tr>
<tr>
<td>object</td>
<td>Object</td>
</tr>
</table>

<b>The full list of the supported attributes for each param are listed below:</b>
<p>Table 2. <b>Supported param attrs</b></p>
<table>
<thead>
<tr>
<th>Attribute key</th>
<th>Mandatory</th>
<th>Description</th>
<th>Applies to</th>
</tr>
</thead>
<tbody>
<tr>
<td>key</td>
<td>yes</td>
<td>the key name of the parameter. For example, if on a route you expect for a param with the name "x", then the key
of this param is "x"</td>
<td>all types</td>
</tr>
<tr>
<td>type</td>
<td>yes</td>
<td>the type of the parameter. Might be one of: "int", "date", "oneof", "boolean", "numeric", "string", "array" and "object"</td>
<td></td>
</tr>
<tr>
<td>humanReadable</td>
<td>no</td>
<td>a short title of the parameter. This is used by the parameters validator on the error texts that exports on validation failures</td>
<td>all types</td>
</tr>
<tr>
<td>description</td>
<td>no</td>
<td>the description of the parameter. It will be used on the auto-generated documentation of your API</td>
<td>all types</td>
</tr>
<tr>
<td>mandatory</td>
<td>no</td>
<td>defines whether the parameter is mandatory or not. If it's missing the parameter is not mandatory</td>
<td>all types</td>
</tr>
<tr>
<td>validationFailureTexts</td>
<td>no</td>
<td>An object containing the text messages that will sent back to the client for all (or any) cases that the validation fails. For example,
if a mandatory field is missing the text that will be sent back to the client is defined on the key "mandatory" of this object, etc. The
supported keys of this object are listed on the very next table that follows.</td>
<td>all types</td>
</tr>
<tr>
<td>min</td>
<td>no</td>
<td>the minimum value (including this) that a param can accept</td>
<td>int, numeric</td>
</tr>
<tr>
<td>max</td>
<td>no</td>
<td>the maximum value (including this) that a param can accept</td>
<td>int, numeric</td>
</tr>
<tr>
<td>minChars</td>
<td>no</td>
<td>the minimum characters that a string's type parameter's value might have</td>
<td>string</td>
</tr>
<tr>
<td>maxChars</td>
<td>no</td>
<td>the maximum characters that a string's type parameter's value might have</td>
<td>string</td>
</tr>
<tr>
<td>validationString</td>
<td>yes</td>
<td>the format that a date value should have. The formats are identical as on moment.js</td>
<td>date</td>
</tr>
<tr>
<td>minLength</td>
<td>no</td>
<td>the minimum length an array-type value should have</td>
<td>array</td>
</tr>
<tr>
<td>maxLength</td>
<td>no</td>
<td>the maximum length an array-type value should have</td>
<td>array</td>
</tr>
<tr>
<td>acceptedValues</td>
<td>yes</td>
<td>an array listing all the acceptable values for this param</td>
<td>oneof</td>
</tr>
<tr>
<td>keys</td>
<td>no</td>
<td>an object that specifies the expected structure of an object type parameter</td>
<td>object</td>
</tr>
</tbody>
</table>

<b>The supported keys of the validationFailureTexts are:</b>
<p>Table 3. <b>validationFailureTexts supported attributes</b></p>
<table>
<thead>
<tr>
<th>Key</th>
<th>In case...</th>
</tr>
</thead>
<tbody>
<tr>
<td>type</td>
<td>the type of the field's value is not of the defined/expected field's type</td>
</tr>
<tr>
<td>mandatory</td>
<td>a mandatory filed is missing</td>
</tr>
<tr>
<td>min</td>
<td>the either of type int or numeric field's value is lower than the minimum accepted, according to the min attribute of the field's definition</td>
</tr>
<tr>
<td>max</td>
<td>the either of type int or numeric field's value is greater than the maximum accepted, according to the max attribute of the field's definition</td>
</tr>
<tr>
<td>minChars</td>
<td>the characters of the provided string are less than the minimum accepted, according to the minChars attribute of the field's definition</td>
</tr>
<tr>
<td>maxChars</td>
<td>the characters of the provided string are more than the maximum accepted, according to the maxChars attribute of the field's definition</td>
</tr>
<tr>
<td>validationString</td>
<td>the value provided for the field of type date is not compatible with the validationString of the field's definition</td>
</tr>
<tr>
<td>minLength</td>
<td>the length of the array passed on the specific field's value is lower than the minimum accepted, according to the minLength attribute of the field's definition</td>
</tr>
<tr>
<td>maxLength</td>
<td>the length of the array passed on the specific field's value is greater than the maximum accepted, according to the maxLength attribute of the field's definition</td>
</tr>
<tr>
<td>acceptedValues</td>
<td>the value of the, of type oneof, field is not present on the acceptedValues array on the field's definition</td>
</tr>
</tbody>
</table>

So, as an example:
<p>Code Snippet 2. <b>Parameter's structure including validationFailureTexts object</b></p>
<pre lang="javascript"><code>
param: {
    "key": "user_age",
    "type": "int",
    "humanReadable": "Age",
    "description": "The age of the user",
    "mandatory": "true",
    "min": 18,
    "validationFailureTexts": {
        "mandatory": "Please provide your age",
        "min": "Sorry, you must be at least 18 years old"
    }
}
</code></pre>

In such case if the submitted value for the "age" is under 18 (let's say 17) then on the "errors" array of the response there will be the
text "Sorry, you must be at least 18 years old". If the key "min" was missing from the "validationFailureTexts" object (of if
the "validationFailureTexts" was missing at all on the field's definition), the error text that would be included on the errors array would be the default:
"Age must be greater or equal to 18. 17 provided."<br/>
Finally, in the case that there was the "humanReadable" key missing from the field's definition, then the error text would be:
"user_age must be greater or equal to 18. 17 provided."
<p>
Now it's time to proceed with your Reusable Params File.<br/>
The reusable params file is just a module that exports an object. This object has a number of keys. Each
key holds another object which represents the definition of a parameter. <br/>
The name of the key is the way you'll refer to the parameter from the Routes Tree Configuration File.<br/>
So, let's assume that you want to define two reusable parameters on this file, parameter "id" and parameter
"cat_id". Here's a possible / valid definition of these two params in the Reusable Params File:
<p>Code Snippet 3. <b>Example of Reusable Params File</b></p>
<pre lang="javascript"><code>
module.exports = {
    id:{
        key:'id',
        type:'int',
        humanReadable: 'organization id',
        description:'The Organization from which data is requested',
        mandatory:true
    },
    category: {
        key:'cat_id',
        type:'oneof',
        humanReadable: 'Product category',
        description:'The category of the product',
        mandatory:false,
        acceptedValues: ['shoes', 'clothes'],
        validationFailureTexts: {
            acceptedValues: 'Sorry, only shoes or clothes categories are supported'
        }
    }
}
</code></pre>
Pay attention that we have a unique name for each parameter defined here, which is the key of the
exported module. This name will be used in the Routes Tree Configuration File in order to load and
define the parameters that each route will expect for. <br/>
Though, each of these params have a "key" attribute. This is the name of the parameter as we expect it
during the actual calls that our service will receive.
</p>

<h3>Defining object type params</h3>
As mentioned, one of the supported param types is the "object". Also, one of the supported on object-type parameter's attributes
is "keys".<br/>
You can use the "keys" attribute of an object parameter in order to define (to any depth) the expected structure of the object
and not only this. You can apply / define validation rules of each of them, no matter which depth it is. Here's an example:<br/>
Let's suppose that on a specific call we expect for a parameter with the name "user_data" which will hold the user's information
in a well defined structure. Both the structure of the expected object and the validation rules that apply to it are made
obvious through the following parameter definition:
<p>Code Snippet 4. <b>Example of an object parameter</b></p>
<pre lang="javascript"><code>
user:{
    key:'user_data',
    type:'object',
    humanReadable:'User data',
    description:'Full user information',
    mandatory:true,
    keys:{
        gender:{
            type:'oneof',
            mandatory:true,
            acceptedValues: ['male', 'female'],
            validationFailureTexts: {
                mandatory: 'Please specify your gender',
                acceptedValues: 'Please pick between male and female'
            }
        },
        country:{
            type:'oneof',
            acceptedValues:['Greece', 'Sweden', 'Australia', 'Romania']
        },
        name:{
            type:'object',
            keys:{
                first:{
                    mandatory:true,
                    type:'string'
                },
                last:{
                    mandatory:true,
                    type:'string',
                    validationFailureTexts: {
                        mandatory: 'Please specify your last name'
                    }
                },
                middle: {
                    mandatory: false,
                    type: 'string'
                }
            }
        }
    }
}
</code></pre>
So, as you can see, not only we define the structure of the expected object but we can define the validation rules that might
apply to any of the keys of the object. Please mention that the "name" key is an object itself and it also contains the "keys"
parameter which holds the information regarding the expected keys of it. There's no limit on the depth of the nested objects
and parameters.<br/>
The "keys" param is an object which holds a set of keys. These keys represent / map the expected keys of the object.<br/>
The attributes of each one of these keys are identical with the attributes used in plain (not-object) parameters. All attributes
of table 2 apply just fine to all nested keys of all objects. The only difference between the definition of a plain parameter
and the definition of an object's key is that on the object key's definition there's no "key" attribute. The "key", that is
the expected name of the key on the provided object during a call, is identical to the name of the key itself. E.g. on the
specific example we expect the user_data.name.first to be present.<br/>
This has been implemented this way for two reasons:
<ul>
<li>There's no need and no way to refer to a nested key from services such as the FieldsLoader (we'll see about that later on)</li>
<li>We wanted to mimic the structure of the object in an one-to-one mapping</li>
</ul>
During the parameters validation process, which we'll analyse on following chapter, the full object is been validated according
to the definition of it. Don't worry this process is 100% asynchronous, so you can go ahead and create as deep, as long and
as complex object parameter definitions. It won't block your app during validation.

<h2>Routes Tree Configuration File</h2>
Now that we've defined the parameters that we're going to (re)use on our endpoints, it's time to define
these calls. <i>Of course you can always come back to the Reusable Params File and update it with new
ones.</i>
All of the supported routes of our application are defined in this very file. <br/>
In order to be able to reuse the parameters we defined in the Reusable Params File, we need the (built in) FieldsLoader
module. For this the structure / format of our Routes Tree Configuration File should look like this:
<p>Code Snippet 5. <b>Basic structure of the Routes Tree Configuration File</b></p>
<pre lang="javascript"><code>
module.exports.conf = function(fieldsLoader){
    return {
        routes:{
            // here go all of the supported routes of the application
        }
    }
};
</code></pre>

You might have noticed the term "Tree" in the name of the "Routes Tree Configuration File". Before further analysing the
way we can define your routes in here, it's good to mention a few things regarding its concept.<br/>
In an application there might be routes of the same url (e.g. /a/b) but of different types (e.g. GET, POST). Also, in
an application there might be routes that do something and also subroutes of it that do something else. For example,
there might be the route /a/b and also the route /a/b/c.<br/>
The way the routes are defined on the Routes Tree Definition File respect both of the above facts. On any given path you
can separately define the various supported call types and then you can continue deeper defining the supported subroutes of it.<br/>
In the specific example here's a possible / valid Routes Tree Configuration File:
<p>Code Snippet 6. <b>Routes Tree Configuration File including paths and endpoints</b></p>
<pre lang="javascript"><code>
module.exports.conf = function(fieldsLoader){
    return {
        routes:{
            a:{
                subRoutes: {
                    b: {
                        get: {
                            // here goes the GET /a/b route definition
                        },
                        post: {
                            // here goes the POST /a/b route definition
                        },
                        subRoutes: {
                            c: {
                                get: {
                                    // here goes the GET /a/b/c route definition
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
</code></pre>

In general, the tree that we are defining here consists of paths and endpoints. Everything starts on the "routes" parameter
of the returned object. "a" represents a path, the path "/a". This path has subRoutes, like "/a/b". So, we define these
subroutes on the "subRoutes" parameter of it.<br/>
"b" is a path itself as well. Following the object's structure, is obvious that it represents the path "/a/b". A path might
have (or might not have) endpoints. For example the path "/a" does not have any endpoints. Though, path "/a/b" has get and post
endpoints. <br/>
The endpoints are defined by the use of the corresponding key (one of "get", "post", "put", "delete"). The endpoints are the "leafs"
of this tree while the paths act as the branches.<br/>
A branch can have sub-branches and leafs. A leaf cannot have neither sub-branches nor sub-leafs, and that's we call then "endpoints".<br/>
Within the "subRoutes" parameter of any path we can only define paths.<br/>
On any endpoint we can define the fields that we're expecting.<br/>
Here's a table with all the supported attributes of each element:
<p>Table 4. <b>Path's supported attributes</b></p>
<table>
<thead>
<tr>
<th>Attribute name</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>groups</td>
<td>an array containing all the groups the path belongs to</td>
</tr>
<tr>
<td>subRoutes</td>
<td>an object which keys will represent the next sub-section of the path</td>
</tr>
<tr>
<td>any of the supported call types (one of "get", "post", "put", "delete")</td>
<td>defines an endpoint to the specific path. E.g. by placing the "get" key on a path it's value must be an object defining
the characteristics of the specific endpoint</td>
</tr>
</tbody>
</table>

<p>Table 5. <b>Endpoints's supported attributes</b></p>
<table>
<thead>
<tr>
<th>Attribute name</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>groups</td>
<td>an array containing all the groups the path belongs to</td>
</tr>
<tr>
<td>alias (optional)</td>
<td>a string representation / alias name of the specific endpoint</td>
</tr>
<tr>
<td>description (optional)</td>
<td>a human readable description of the endpoint. This will be used on the auto-generated documentation of your API</td>
</tr>
<tr>
<td>fields (optional)</td>
<td>an array containing all the fields that are expected on this endpoint. It will be used both by the validator and the
auto-generated documentation process. If your endpoint does not expect any parameters or you don't want to apply any
params validation you can just skip it</td>
</tr>
<tr>
<td>mock</td>
<td>in cases you want a specific endpoint to serve mock data just put the mock attribute and set it to true</td>
</tr>
</tbody>
</table>

<h3>Groups</h3>
Both on tables 4 and 5 you might have noticed the "groups" attribute. The "groups" attribute helps us organize / categorize
all of our endpoints into categories / groups.<br/>
The grouping mechanism follows a waterfall inheritance mechanism, just like inheritance works on html elements. Every child inherits
by default the groups of its closest parent. If its closest parent has no group definition then that means it inherits its own
closest parent's groups etc.<br/>
For any element in our tree (either endpoint or path), this inheritance goes all the way up until we have an explicit groups definition.<br/>
So if you have endpoints / routes defined on /admin/* and all belong to a specially restricted area of your application, where
admin authentication should take place, the only thing you have to do is to define on the /admin path the groups equal to ['admin']. All
of the child paths and endpoints of it will inherit this groups definition. <br/>
At any point, at any path or endpoint, you can explicitly define the groups attribute. By this way, any inherited value of the
attribute "groups" will be ignored and the explicitly defined will prevail.<br/>
By organizing the endpoints into groups on the Routs Tree Configuration File gives us the opportunity apply middlewares
specially developed for each of these groups. We'll see more details on this later on.<br/>
Finally, as you might have noticed, groups is an array. That means that for an endpoint belonging to more than one groups,
all middlewares of all groups it belongs to will be applied in the sequence the group names have been placed within the array.

<h3>Alias / Mock operation</h3>
The "alias" attribute of each endpoint gives us a way to refer to this endpoint from any other part of the Express Happiness
ecosystem. The most important usage of this "alias" has to do with the mock operation. As mentioned on table 5, along with the
"alias" attribute each endpoint (optionally, default = false) might have a "mock" attribute set to true. <br/>
We will analyse mock operation in details in a following part of this document, though keep just one thing in mind for now.
If any of the endpoints has been set to server mock data then a file containing the mock response should be present somewhere in
your hard drive. The folder that contains all mock files is defined on ExpressHappiness invocation, though the actual name
of the file, for each endpoint, should be identical with its alias.

<h3>fields</h3>
The fields is an array containing all the fields that the specific endpoint supports / expects. As explained, all of the
fields / params have a very specific definition pattern that has been analyzed on the Reusable Params File section. <br/>
The fields array might "load" fields from the reusable fields or can either include newly defined params.<br/>
In order to load a parameter from the params defined on the Reusable Params File you should use the method "getField" of the
FieldsLoader module that comes with the ExpressHappiness framework. <br/>
Here is a complete example, using the fields defined on code snippet 3:
<p>Code Snippet 7. <b>Routes Tree Configuration File example with fields loading</b></p>
<pre lang="javascript"><code>
module.exports.conf = function(fieldsLoader){ // mind the "fieldsLoader" argument
    return {
        routes:{
            a:{
                subRoutes: {
                    b: {
                        get: {
                            alias: 'a_b_get',
                            description: 'a dummy description of a dummy endpoint',
                            fields: [
                                fieldsLoader.getField('id'),
                                fieldsLoader.getField('category', {
                                    mandatory:true
                                }),
                                {
                                    key: 'size',
                                    mandatory: true,
                                    type: 'numeric'
                                }
                            ]
                        }
                    }
                }
            }
        }
    }
};
</code></pre>

As you can see, on the GET "/a/b" endpoint we have defined three fields:
<ul>
<li><b>by loading the "id" field.</b> The resulting field is identical as the definition of the field on the Reusable Params File (code snippet 3)</li>
<li><b>by loading the "category" field and passing second argument on getField.</b> The "getField" method of FieldsLoader takes a second optional
attribute. This attribute is an object. All own keys of this object that are included in the supported params attrs list (table 2) will overwrite the
ones defined on the Reusable Params File.</li>
<li><b>A totally new parameter.</b> There are cases where a parameter might appear only once and only in one endpoint. In such cases there's
absolutely no need to define it on the Reusable Params File but, instead, you can define it directly on the "fields" array of the endpoint.</li>
</ul>

<h3>Dynamic routes</h3>
A question that arises has to do with the dynamic routes (e.g. "/a/b/:c"). This is of course supported by ExpressHappiness
and you can totally use it on your Routes Tree Configuration File. You can access these fields as you would usually do through
the <a href="http://expressjs.com/api.html#req" target="_blank">req object</a> of express.</br>
Here's a simple demonstration on how to define routes including dynamic params:

<p>Code Snippet 8. <b>Dynamic Route Params</b></p>
<pre lang="javascript"><code>
module.exports.conf = function(fieldsLoader){ // mind the "fieldsLoader" argument
    return {
        routes:{
            a:{
                subRoutes: {
                    ":b": { // check the ":b" on the subRoute key
                        get: {
                            // endpoint definition
                        }
                    }
                }
            }
        }
    }
};
</code></pre>

<h2>Error Handling and Error Handling Configuration File</h2>
The way errors are handled by Express Happiness is centralized and configurable. All errors, including the unknown, are
handled by the framework itself and the developer has the ability to configure the behaviour of the app in each error type.
Express Happiness also provides the ability to define custom error types, define the behaviour of the app in each of them,
trigger such errors from anywhere in your middlewares chain and let the framework take care of them accordingly.<br/>
The way each error type should be treated by the application is defined on the Error Handling Configuration File.
<br/>The basic structure of this file is the following:
<p>Code snippet 9. <b>Error Handling Configuration File Basic Structure</b>
<pre language="javascript"><code>
exports.errors = {
    undefinedError:{
        log:true,
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
    },
    'my_custom_error_code':{
        log:false,
        sendToClient:{
            code:500,
            data:'There was an error fulfilling your request'
        }
    }
}
</code></pre>

The Error Handling Configuration File exports an object. Each object key represents the "type" of the error. So, in our
example, if an undefined error gets triggered by the app, our application will log it, it will write to the log file the
text "Unresolved error code" and the client will receive a 500 code along with the body "ErrCode: 1 - There was an error
fulfilling your request at the moment. Please try again in a while".</br>
Let's dive deeper and see which attributes are supported for each error type defined on this file.
<p>Table 6. <b>Supported attributes on error configuration</b></p>
<table>
<thead>
<tr>
<th>Attribute name</th>
<th>Type</th>
<th>Mandatory</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>log</td>
<td>boolean</td>
<td>no (default: false)</td>
<td>If log is set to true, this error will be logged to the error.log file</td>
</tr>
<tr>
<td>humanReadable</td>
<td>string</td>
<td>no</td>
<td>a human readable description of the error. This is what it will get logged to the error.log file if log is set to true</td>
</tr>
<tr>
<td>sendToClient</td>
<td>object with two keys: code and data</td>
<td>no</td>
<td>with the use of this attribute you can define the response code and the response body that will be sent back to the client. If you
want to send to the client the details of the error object just put there (in quotes) 'err.details'</td>
</tr>
<tr>
<td>hooks</td>
<td>array</td>
<td>no</td>
<td>a list of functions to be executed whenever an error of this type occurs. The hook functions should take 3 arguments:
<ul>
<li>req (the req object)</li>
<li>errorDefinitionObject (the error definition object taken from the Error Handling Configuration File)</li>
<li>err (the actual error triggered during the call stack)</li>
</ul>
These hook functions get executed before your app responds to the client they are not part of the calls chain (they do not
act as middlewares)
</td>
</tr>
</tbody>
</table>

<h3>Triggering Errors</h3>
Once you define all of your error on the Error Handling Configuration File you can at any time, from anywhere on your code
trigger any of these by the use of this, simple, code:
<p>Code Snippet 10. <b>Triggering errors</b></p>
<pre language="javascript"><code>
var err = new Error();
err.type = 'my_custom_error';
err.details = 'The details of the error. Might be either a string, such as this, or any other data type (object, array etc)';
return next(err);
</code></pre>

In order for this part of code to work you must have the "next" function available.
Fot those who are not that familiar with "next" function, please have a look <a href="http://expressjs.com/guide/using-middleware.html" target="_blank">here</a>.
<br/>Once you trigger this event the rest is on Express Happiness to take care of, according to the Error Handling Configuration File.

<h3>Predefined Errors</h3>
Express Happiness comes with a series of error types predefined. These are:
<ul>
<li><b>undefinedError</b> It's triggered for errors that don't belong to any of the defined errors. It's default configuration
is: <br/>
<p>Code Snippet 11.1. <b>Default undefinedError configuration</b></p>
<pre language="javascript"><code>
{
    log:true,
    humanReadable: 'Unresolved error code',
    sendToClient: {
        code:500
    }
}
</code></pre>
</li>

<li><b>invalidAttrs</b> It's triggered on parameters validation failure. It's default configuration
is: <br/>
<p>Code Snippet 11.2. <b>Default invalidAttrs configuration</b></p>
<pre language="javascript"><code>
{
    log:true,
    humanReadable: 'Invalid attributes passed',
    sendToClient: {
        code:400,
        data:'err.details'
    }
}
</code></pre>
</li>

<li><b>404</b> It's triggered whenever a route does not exist. It's default configuration
is: <br/>
<p>Code Snippet 11.3. <b>Default 404 configuration</b></p>
<pre language="javascript"><code>
{
    log:false,
    humanReadable: 'The requested resource does not exist',
    sendToClient: {
        code:404
    }
}
</code></pre>
</li>

<li><b>noMockData</b> It's triggered whenever a route that is defined to serve mock data, does not have any mock data file.
It's default configuration
is: <br/>
<p>Code Snippet 11.4. <b>Default noMockData configuration</b></p>
<pre language="javascript"><code>
{
    log: true,
    humanReadable: 'There is no mock data available for this route yet',
    sendToClient: {
        code: 404,
        data:'There is no mock data available for this route yet'
    }
}
</code></pre>
</li>

<li><b>underDevelopment</b> It's triggered in cases there's no controller function defined for a specific route.
It's default configuration is:<br/>
<p>Code Snippet 11.5. <b>Default underDevelopment configuration</b></p>
<pre language="javascript"><code>
{
    log: false,
    humanReadable: 'A call to a route under development has been made',
    sendToClient:{
        code:501,
        data:'This route is currently under development'
}
</code></pre>
</li>
</ul>
The default behaviour on any of these errors can be altered by redefining them on the Error Handling Configuration File.

<h3>error.log file</h3>
As mentioned earlier in this document, Express Happiness logs errors on an error log file. This file is defined on application
start. Express Happiness does not log all the errors but only those which have log:true on their definition on the Error
Handling Configuration File.<br/>
What's been logged on this document, for each error, is:
<p>Code Snippet 12. <b>Error Line structure logged on the error log file</b></p>
<pre language="javascript"><code>
date | error code | route | human readable explanation of the error | error details
</code></pre>

<h2>Mock Operation</h2>
For any endpoint that you define on your Routes Tree Configuration File, you have the chance to put it in mock operation
status. By "mock operation status" we mean that whenever a user hits the endpoint a static, predefined, mock response will
be served. <br/>
In order to do that you need two things:
<ul>
<li>Configure the endpoint to serve only mock data</li>
<li>Create a JSON file and put it in you mock files folder</li>
</ul>

<h3>How to set mock operation on</h3>
There are multiple ways to do that. First of all, in order to enable mock operations you have to set the mockData operation
on during the initialization of your application. We will see more details regarding the initial configuration object
passed on application start later on, though for now just keep in mind that when we start our application we pass a configuration
object which on "mockData" key holds an object that defines the folder of your mock files and the flag that set mock operation
on or off.<br/>
Having our mock folder defined and set mock operation to on we can force an endpoint to serve mock data by:
<ul>
<li>Putting in our mock files folder a file with the name --endpoint-alias--.json, where "--endpoint-alias--" is the alias
of the endpoint defined on the key "alias" of the endpoint on the Routes Tree Configuration File</li>
<li>Setting the operation status of the endpoint to mock by setting the "mock" attribute of the endpoint on the Routes Tree
Configuration File to true</li>
<li>Or by passing the parameter "mock" equals to 1 during the call</li>
</ul>
By this way, whenever you hit the specific endpoint you'll always get back the mock data defined on the specified file on
the mock files folder.

<h2>Controller Functions</h2>
Up to now we've seen almost everything regarding the definition process of an endpoint, the params validation and the error
handling mechanisms but we've said nothing regarding the actual controller function.<br/>
Assuming that a call passes all the middlewares, all the checks and it's not on mock operation status it reaches to the point
where something actual needs to take place, a controller function should take care of the call.<br/>
All controller functions are defined in a single file. As stated in the beginning of this document, the actual aim of this
architectural decision is not, of course, to pack all the code within this file but more to have one single point where you
can assign responsibilities and define the controllers of all of your routes in a clean and readable way.<br/>
This single file is called Controller Functions File and it looks like this:

<p>Code Snippet 12. <b>Example of Controller Functions File</b></p>
<pre language="javascript"><code>
var adminFunctions = require('./functions/admin.js');
var userFunctions = require('./functions/user.js');

var functions = [];

functions['route-alias-1'] = adminFunctions.doSomething;
functions['route-alias-2'] = userFunctions.doSomethingElse;

exports.functions = functions;
</code></pre>
It's just a mapping of all controller functions to the routes. As you can see from the example snippet 12, the Controller
Functions File should export an array. An associative array the keys of which are alias name of each route and the values
the corresponding controller functions of them. <br/>
The controller function for each endpoint is in the exact same format as a simple controller function that you would define
if you used express without Express Happiness. That is:
<p>Code Snippet 13. <b>Controller Function format</b></p>
<pre language="javascript"><code>
var my_controller_function = function(req, res, next){
    // do your magic here
}
</code></pre>
The third argument (next) is optional though if you want to use the automatic error handling mechanism within these functions
(that means to create a custom error, trigger it and let the Error Handling mechanism take care of it) you
certainly need the next function (see code snippet 10).

<h2>Application Configuration on start</h2>
Having the full of your application configured it's now time to fire it up. Express Happiness starts with the command:
<p>Code Snippet 15. <b>Starting your Express Happiness Server</b></p>
<pre language="javascript"><code>
var app = express();
var router = express.Router();

var eh = new expressHappiness(app, router, {
    mockData:{
        enable: true,
        folder: '/path/to/mockdatafolder',
        global: true
    },
    reusableFieldsFile: '/path/to/reusableFields.js',
    errorFile: '/path/to/errors.log',
    errorsConfigurationFile: '/path/to/conf/errors.js',
    apiConfigurationFile: 'path/to/conf/restConf.js',
    controllersFile: '/path/to/controllerFunctions.js'
});


eh.generate('/v1',
    {
        'userAccess':[middlewareA, middlewareB],
        'adminAccess':[middlewareC, middlewareD],
        'eh-allRoutes':[middlewareX]
    },
    {
        'userAccess':[middlewareA, middlewareB],
        'adminAccess':[middlewareC, middlewareD],
        'eh-allRoutes':[middlewareX]
    }
);
</code></pre>

First thing to do is to create a new Express Happiness instance. This is done by calling "new expressHappiness" function.
This function takes three parameters:
<ul>
<li><b>app</b>: the application initialized by the express() function invocation</li>
<li><b>router</b>: The Router object provided by express which we can get through express.Router() invocation</li>
<li><b>configuration</b>: a configuration object that sets the full Express Happiness environment up. Here we define the
path of each file needed by EH and also the mock operation configuration.</li>
</ul>

After creating the EH instance we call the "generate" function of it. The "generate" function takes three parameters:
<ul>
<li><b>route path</b>: this is the base url that our application will support. For example if we are developing a REST
API that listens to paths under /v1/ then we don't need to define this on the Routes Tree Configuration File. We can
define it here by passing the '/v1' value on the first argument of the generate function</li>
<li><b>pre-validation middlewares</b>: On the middlewares chain that are been executed on each call on our application,
EH always includes a middleware that performs the params validation for the given endpoint. The second argument
of the "generate" function provides us the ability to define a series of middlewares we want to get executed before reaching
the params validation step. The middlewares defined here, most often have to do with authentication issues. <br/>
The way we define our middlewares provides us the ability to explicitly define which middlewares should be executed according
the group that each route belongs to (see table 5). As mentioned, each endpoint might belong to one or more groups and this
is defined by the "groups" attribute (which holds an array). So, in our example for all endpoints that belong to the 'userAccess' group
the middlewareA and middlewareB functions will be executed before the middlewares chain reaches the params validation step. For
all middlewares that belong to the 'adminAccess' group the middlewareC and middlewareD will be executed before the params
validation middleware gets execute and so on. <br/>
If we want to define pre-validation middlewares for all of our endpoints, no matter the groups they belong to, we can use
the "eh-allRoutes" key to define them. All middlewares included on this array are going to be executed, in the order they
appear within the array, on all of our endpoints.
</li>
<li><b>post-validation middlewares</b>: The exact same things stand here. The third argument of the "generate" function
expects an object that though its keys defines the middlewares to be executed after the params validation process, on
our routes, depending on the groups they belong to.
</li>
</ul>

The form of our middlewares should be the typical middleware form of express: function(req, res, next).













































