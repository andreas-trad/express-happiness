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
Every ExpressHappiness project consists of a number of files. These files are:
<ul>
<li><b>Routes tree configuration</b>: On this file you'll put / define all
of the supported routes of your app with all of their details</li>
<li><b>General configuration file</b>: This file holds configuration regarding </li>
</ul>