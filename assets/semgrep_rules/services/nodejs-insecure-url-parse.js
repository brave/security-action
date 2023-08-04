// ruleid: nodejs-insecure-url-parse
url.parse("here lies dragons");
// ruleid: nodejs-insecure-url-parse
require('url').parse("here lies dragons");

var uparser = require('url');

// ruleid: nodejs-insecure-url-parse
uparser.parse("here lies dragons");

function() {
  // ruleid: nodejs-insecure-url-parse
  uparser.parse("here lies dragons");
}

// ruleid: nodejs-insecure-url-parse
setTimeout(()=> uparser.parse("here lies dragons"), 1000);
