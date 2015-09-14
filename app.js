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
	pagesize=20;
	page=1;
	if(typeof req.query.per_page!=='undefined'){
		pagesize=parseInt(req.query.per_page);
	}

	if(typeof req.query.page!=='undefined'){
		page=parseInt(req.query.page);
	}

	MongoClient.connect(dbhost, function(err, db) {
	  var collection = db.collection('party');
	  collection.find({},{_id:0}).skip(pagesize*(page-1)).limit(pagesize).toArray(function(err, items) {
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

app.get('/:id',function(req,res){
	pagesize=1;
	page=1;
	var id=new ObjectID.createFromHexString(req.params.id);
	MongoClient.connect(dbhost, function(err, db) {
	  var collection = db.collection('party');
	  collection.findOne({id:id},{_id:0},function(err, item) {
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

function respond(req,res,data,total){
	var length=1;
	var unicode=true;
	var format="unicode";
	var total_pages=Math.ceil(total/pagesize);
	var links={
		next:'?token='+req.query.token+'&page='+(page+1)+'&per_page='+pagesize,
		previous:'?token='+req.query.token+'&page='+(page-1)+'&per_page='+pagesize
	};

	if(total===null){
		links=null;
	}

	if(page===1){
		links.previous=null;
	}

	if(page===total_pages){
		links.next=null;
	}

	if(Array.isArray(data)) length=data.length;

	var resp={
		_meta:{
			status:"ok",
				count:length,
				api_version: 1,
				unicode:unicode,
				format:format,
				per_page:pagesize,
				current_page:page,
				total_pages:total_pages,
				links:links
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
