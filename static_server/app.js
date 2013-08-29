var PORT = 9000;

var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var mime = require('./mime').types;
var config = require('./config');
var zlib = require('zlib');


var server = http.createServer(function(request,response){
	var pathname = url.parse(request.url).pathname;
	var realPath = 'assets' + pathname;





	fs.exists(realPath,function(exists){
		if(!exists){
			response.writeHead(404,{
				'Content-Type':'text/plain'
			})
			response.write('The request url: ' + pathname + ' is not found');
			response.end();
		}else{

			var ext = path.extname(realPath);
			ext = ext ? ext.slice(1):'unknown';
			var contentType = mime[ext] || 'text/plain';
			response.setHeader('Content-Type',contentType);

			fs.stat(realPath,function(err,stat){
				var lastModified = stat.mtime.toUTCString();
				var ifModifiedSince = 'If-Modified-Since'.toLowerCase();
				response.setHeader('Last-Modified',lastModified);

				if(ext.match(config.Expires.fileMatch)){
					var expires = new Date();
					expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
					response.setHeader('Expires',expires.toUTCString());
					response.setHeader('Cache-Control','max-age='+ config.Expires.maxAge)
				}

				if(request.headers[ifModifiedSince] && lastModified == request.headers[ifModifiedSince]){
					response.writeHead(304,'Not Modified');
					response.end();
				}else{

					var raw = fs.createReadStream(realPath);
					var acceptEncoding = request.headers['accept-encoding'] || '';
					var match = ext.match(config.Compress)

					if( match && acceptEncoding.match(/\bgzip\b/)){
						response.writeHead(200,'ok',{'Content-Encoding':'gzip'});
						raw.pipe(zlib.createGzip()).pipe(response)
					}else if(match && acceptEncoding.match(/\deflate\b/)){
						response.writeHead(200,'ok',{'Content-Encoding':'deflate'});
						raw.pipe(zlib.createDeflate()).pipe(response)
					}else{
						response.writeHead(200,'ok')
						raw.pipe(response)
					}
					/**
					fs.readFile(realPath,'binary',function(err,file){
						if(err){
							respones.writeHead(500,{
								'Content-Type':'text/plain'
							})
							respones.write(err);
							respones.end();
						}else{
							response.writeHead(200,{
								'Content-type':contentType
							})
							response.write(file, "binary");
							response.end();
						}
					})
					**/
				}


			})
		}
	})
})

server.listen(PORT)
console.log('listen '+PORT+' success!')