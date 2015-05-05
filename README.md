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

<h2>Routes Tree Configuration File</h2>
Now that we've defined the parameters that we're going to (re)use on our endpoints, it's time to define
these calls. <i>Of course you can always come back to the Reusable Params File and update it with new
ones.<i/>
All of the supported routes of our application are defined in this very file.