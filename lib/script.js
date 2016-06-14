var fs = require('fs');
var babel = require('babel-core');
var testcov = require('./transform-coverage');

// read the filename from the command line arguments
var fileName = process.argv[2];

babel.transformFile(fileName, {
  plugins: [testcov]
}, function(err, result){
  console.log(err || result.code);
});

