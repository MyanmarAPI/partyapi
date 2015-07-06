var express = require('express');
var app = express();
var csvjson = require('csvjson');
var traverse = require('traverse');
var knayi = require("knayi-myscript");

app.use(express.static('app'));


app.get('/',function(req,res){
	var party=csvjson.toObject('data/my-parties.csv').output;
	var format="unicode";
	if(req.query.font==='zawgyi'){
		party=unizaw(party);
		format="zawgyi";
	}
	var resp={
		_meta:{
			status:"ok",
				count:party.length,
				api_version: 1,
				unicode:true,
				format:format
		},
		data:party
	};
	res.json(resp);
});

var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

function zawuni(obj){
	traverse(obj).forEach(function (x) {
    if (typeof x !== "object") {
      this.update(knayi(x).fontConvertSync('unicode5'));
    }
	});
	return obj;
}

function unizaw(obj){
	traverse(obj).forEach(function (x) {
    if (typeof x !== "object") {
      this.update(knayi(x).fontConvertSync('zawgyi'));
    }
	});
	return obj;
}

module.exports = app;
