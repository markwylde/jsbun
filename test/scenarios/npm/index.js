const app = require('./app');

/*
  But this is a comment so we
  are not going to require('anything')
*/

// This is also a comment so no require('please')

app.on('test', function () {
  console.log('yay');
});
