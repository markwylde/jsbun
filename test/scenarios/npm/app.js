const { EventEmitter } = require('events');

const app = new EventEmitter();

setTimeout(function () {
  app.emit('test');
}, 100);

module.exports = app;
