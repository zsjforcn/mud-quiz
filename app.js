
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var subject = require('./routes/subject');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);

// 试题
app.get('/subject', subject.new);
app.post('/subject', subject.new);
app.get('/subject/:id', subject.list);
app.post('/subject/:id', subject.modify);
app.delete('/subject/:id', subject.remove);
app.get('/subjects', subject.listAll);

//
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
