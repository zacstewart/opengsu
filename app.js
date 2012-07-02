var connect = require('connect'),
  express = require('express'),
  jade = require('jade'),
  app = express.createServer();

app.configure(function () {
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/views');
  app.use(connect.bodyParser());
  app.use(connect.static(__dirname + '/public'));
  app.use(connect.static(__dirname + '/assets'));
  app.use(express.cookieParser());
  app.use(express.logger());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.get('/', function (req, res) {
  res.render('index', {msg: 'Hello, world!', layout: 'layout'});
});

app.listen(3000);
console.log('Server at http://0.0.0.0:3000');
