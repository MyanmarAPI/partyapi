var express = require('express');
var app = express();
var csvjson = require('csvjson');
var traverse = require('traverse');
var rabbit = require("rabbit-node");
 

app.use(express.static('app'));
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/party',function(req,res){
	var party=csvjson.toObject('app/data/my-parties.csv').output;
	if(typeof(req.params.font)!=='undefined' && req.params.font==='zawgyi'){
		party=unizaw(party);
	}
	res.send(party);
});

var server = app.listen(8080, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

function zawuni(obj){
	traverse(obj).forEach(function (x) {
    	this.update(rabbit.zg2uni(x));
	});
	return obj;
}

function unizaw(obj){
	traverse(obj).forEach(function (x) {
    	this.update(rabbit.uni2zg(x));
	});
	return obj;
}