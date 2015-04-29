<h1>Express Happiness</h1>
===========================

<h2>Intro</h2>
ExpressHappiness is a reach framework for creating web apps and services, built on top of 
<a href="http://expressjs.com/" target="_blank">express framework</a>.<br/>
We all use and love express. When it comes to large and complex apps, some times the 
maintainability of them becomes hard as we keep on adding routes, handle errors and permissions.<br/>
ExpressHappiness provides a way that gives the developers the ability to develop robust and maintainable apps or REST APIs using express.<br/>
The main features of the framework are the above:
<ul>
<li>the full routes tree is defined in a single object, in a JSON-like manner</li>
<li>error handling is defined in the exact same manner in a single file. You can either define your own error codes, define the way that they'll be handled on the errors configuration file
 and trigger them any time from any part of your code and let the framework handle them the way you defined</li> 
<li>define permissions to each route by defining the group that each route belongs to, directly on the routes tree configuration file in a waterfall inheritance mode</li>
<li>validate the params of each call by defining their characteristics on the routes definition file</li>
<li>automatically generate your rest api definition</li>
<li>apply middlewares to group of routes</li>
<li>work with mock data, by just putting a file on specific folder and set mock parameter to true on the conf file</li>
<li>put function hooks to any error type</li>
<li>and many more...</li>
</ul>

<h2>Install</h2>
<code>
$ npm install express-happiness
</code>

<h2>Starting with it</h2>
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