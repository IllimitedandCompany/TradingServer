const express = require('express');
const bodyParser= require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const db = require(__dirname+'/js/database/mongodb');
const time = require(__dirname+'/js/time/date.js');

// Trading Requires
const test1Routes = require(__dirname + '/js/trading/testTrader1.js');
const test2Routes = require(__dirname + '/js/trading/testTrader2.js');

module.exports = app;

app.use(express.static(__dirname));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));

// Trading Routes
app.use(test1Routes);
app.use(test2Routes);

app.set("views",__dirname + '/html');
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000));

// Uncaught Errors
process.on('uncaughtException', (error) => {
	console.log(error)
});

app.get('/', function(req, res) {
    res.render('pages/home');
});

db.checkConnection();

app.listen(app.get('port'), function() {
  console.log('Time now: '+time.getExactTime()+'\nTrading Server running on: ', app.get('port'));
});

