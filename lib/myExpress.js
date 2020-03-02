let fs = require("fs");
const { parse } = require('querystring');

let app={
  dispatch: function(path,extname) {
    let site='';
       if (path == '/'|| path == '/?')
    {
      site = './index.html';
    }
    else
    if (extname == '')
    {
     site =  './views/login.ejs';
    }
    else
   if (fs.existsSync('./views' + path + '.ejs' )) 
    {
     site = './views' + path+ '.ejs';
   } 
   else
   if (fs.existsSync('./views' + path )) 
   {
    site = './views' + path;
  } 
    else
    site = '.'+path;
 return site;
},
mimeTypes: {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
  ,'.ejs': 'text/html; charset=utf-8'
},
Render: function(response,content,contentType){
  response.writeHead(200, { 'Content-Type': contentType });
  response.end(content, 'utf-8');
},
postForm: function(request, cb)
{
  //if (request.method === 'POST') {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if(request.headers['content-type'] === FORM_URLENCODED) {
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });
    request.on('end', () => {
      //console.log('parse',parse);
        cb(null,parse(body));
    });}
    else{
      cb(null,null);
    }
 // };  
}
}
module.exports = app;