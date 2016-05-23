# Router Hijack

A framework for JavaScript based CSRF/XSS attacks against home routers. 
Developed for the [Languaged Based Security](http://www.cse.chalmers.se/edu/year/2016/course/TDA602/) 
course at Chalmers (spring 2016).

## Building The Project
As the framework is written in TypeScript, some assembly is required. However, 
most build steps are automatically handled by [webpack](https://webpack.github.io/), 
as specified in the [webpack.config.js](./webpack.config.js) file.

### Prerequisites
Before trying to build the project, make sure the following is installed:
* [Node.js](https://nodejs.org/) - Only tested on >= v4.0.0, but older versions might work.

Then use NPM to install application dependencies:

```sh
npm install
```

### Build Variants
There are currently two different build variants, *prod* and *dev*.
The *dev* build includes debugging features (namely source-maps) and
is not minified. The *prod* build produces a minified version without
any source-maps.

The builds are most easily invoked via the `npm run` command, as below:

```sh
# Production build
npm run build:prod

# Development build
npm run build:dev
```

The output from the builds are found in the `./dist` directory. 

### Watching (for development)
For development, it is also possible to have the build system
watch the files and rebuild the project on change. This is significantly
faster than running a manual build each time. To start watching, run:

```
npm run watch
```

## Running The Project
To run the project open the `index.html` file in a browser. The `index.html` file
is found in the output of the builds (i.e. `./dist/prod/index.html` for the prod build).

## Demo
A video was recorded demonstrating the framework:
[https://www.youtube.com/watch?v=MBjTZufinrA](https://www.youtube.com/watch?v=MBjTZufinrA).

A compiled version of the script is also available on the gh-pages:
[http://verath.github.io/router-hijack/](http://verath.github.io/router-hijack/).
