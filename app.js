var express = require('express');
var app = express();
var csvjson = require('csvjson');
var traverse = require('traverse');
var knayi = require("knayi-myscript");
// Retrieve
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var dbhost="mongodb://10.240.33.97:27017/elecapi"




app.use(express.static('app'));


app.get('/',function(req,res){

	MongoClient.connect(dbhost, function(err, db) {
	  var collection = db.collection('party');
	  collection.find().toArray(function(err, items) {
	  	if(err) 
	  		res.json({
	  			_meta:{
					status:"error"
					}
	  		});
	  	else
	  		respond(req,res,items);
	  });
	  
	});
	
	
});

app.get('/detail/:id',function(req,res){
	var id=new ObjectID.createFromHexString(req.params.id);
	MongoClient.connect(dbhost, function(err, db) {
	  var collection = db.collection('party');
	  collection.findOne({_id:id},function(err, item) {
	  	if(err) 
	  		res.json({
	  			_meta:{
					status:"error"
					}
	  		});
	  	else{
	  		respond(req,res,item);
	  	}
	  });
	  
	});
});
var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

function respond(req,res,data){
	var length=1;
	var unicode=true;
	var format="unicode";

	if(Array.isArray(data)) length=data.length;
	
	if(req.query.font==='zawgyi'){
		data=unizaw(data);
		format="zawgyi";
		unicode=false;
	}

	var resp={
		_meta:{
			status:"ok",
				count:length,
				api_version: 1,
				unicode:unicode,
				format:format
		},
		data:data
	};

	res.header("Access-Control-Allow-Origin", "*");
	res.json(resp);
}

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