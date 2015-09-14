var express = require('express');
var app = express();
var csvjson = require('csvjson');
var traverse = require('traverse');
//var knayi = require("knayi-myscript");
// Retrieve
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var dbhost="mongodb://10.240.33.97:27017/elecapi";
var pagesize=20;
var page=1;

var fixDate=function(item){
	if(item===null) return item;
	if(item.establishment_approval_date!==null) item.establishment_approval_date =new Date(item.establishment_approval_date).getTime();
	if(item.registration_application_date!==null) item.registration_application_date =new Date(item.registration_application_date).getTime();
	if(item.registration_approval_date!==null) item.registration_approval_date =new Date(item.registration_approval_date).getTime();
	if(item.establishment_date!==null) item.establishment_date =new Date(item.establishment_date).getTime();
	item.created_at=new Date(item.created_at).getTime();
	item.updated_at=new Date(item.updated_at).getTime();
	return item;
};

app.use(express.static('app'));


app.get('/',function(req,res){

	if(typeof req.query.per_page!=='undefined'){
		pagesize=parseInt(req.query.per_page);
	}

	if(typeof req.query.page!=='undefined'){
		page=parseInt(req.query.page);
	}

	MongoClient.connect(dbhost, function(err, db) {
	  var collection = db.collection('party');
	  collection.find().skip(pagesize*(page-1)).limit(pagesize).toArray(function(err, items) {
	  	if(err)
	  		res.json({
	  			_meta:{
					status:"error"
					}
	  		});
	  	else{
					for (var i = 0; i < items.length; i++) {
						items[i]=fixDate(items[i]);
					}
					respond(req,res,items);
			}

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
				item=fixDate(item);
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

	var resp={
		_meta:{
			status:"ok",
				count:length,
				api_version: 1,
				unicode:unicode,
				format:format,
				per_page:pagesize,
				page:page
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
