//let http = require('http')

import {app} from  "./lib/myExpress" ;
//import {magicSession} from  "./sessions/core" ;
declare function require(path: string): any;
let  session = require('./sessions/core').magicSession();
declare var process : {
  env: {
    port: string
  }
}

const HOST = 'localhost';
const webSocket = require("ws");
let fs = require('fs');
let path = require('path');
// app = require('./lib/myExpress');
//app = require('./lib/myExpress');
//let app = _app;
console.log(app.dispatch('',''));

//app;
let ejs = require('ejs');
import {sdb as serverDB} from "./lib/serverDB"
import {sC as serverClass} from "./lib/serverClass"
//let serverDB = require("./lib/serverDB");
// let serverClass = require("./lib/serverClass");
// session = require('./sessions/core');
// magicSession = require('./sessions/core');

const mode = 'AD';
let mySession;
let _user;
let usersOnline=[];
let porthttp = process.env.port || 8125
console.log('session000',require('./sessions/core').magicSession()) 
const serverHttp = require("http").createServer(onRequest);
console.log('session00',require('./sessions/core').magicSession()) 
const handleGreetRequest = (request, response) => {
  console.log('Start ',request.url);
  //if (/Messager/server.js/)
  
  //сессия
  mySession = request.session;
  if(mySession)
{
  //console.log('mySession',mySession);
  serverDB.loginFromSession(mySession.id,function(err, all) {
  if (err) {
    console.log("err loginFromSession",err);
    //cb(err,null);
  }
  if(all)
  {    _user =
    {
      id:     all.id,
      email:  all.email,
      login:  all.login,
      fio:   all.fio
      };
     if(mySession) {console.log(Date(),"Сессия найдена",_user.fio,mySession.id,mySession.id);}
      
    }
    else 
    {
      console.log("Сессия не найдена",_user);
      if(mySession) {console.log(Date(),"Сессия не найдена",mySession.id);}
      _user = null;
    }
  })
  console.log('_user',_user)
  request.logIn(_user);}


  //разборка/определение url

let filePath = '.' + request.url;
 let extname = String(path.extname(request.url)).toLowerCase();
 //console.log('filePath //разборка/определение url',filePath,request.url);

 //выход
 //includes
 if(filePath.match('logout')) 
 { 
   
  console.log('logout');
     request.logout();
   if(_user)
      {          serverClass.login(function(err,user){
              if (err) {
                console.log(err);
                return;
              }
              console.log('logout',_user);
            },_user,null,mode)}
            mySession = null; 
  console.log('logout', request.session.data.user,_user);
   }
   console.log('filePath before dispatch ',filePath,request.url);

  filePath = app.dispatch(request.url,extname);
  console.log(Date(),'filePath',filePath,request.url);


if( request.session && request.session.data.user)
{
     _user = JSON.parse(request.session.data.user);
   // console.log('request.session.data.user',request.session.data.user,'_user' ,_user );
  }
 

 
   extname = String(path.extname(filePath)).toLowerCase();
   //console.log( 'extname', extname);
   let contentType = app.mimeTypes[extname] || 'text/html; charset=utf-8';

//POST login
    if (request.method === 'POST') {
      console.log('POST',request.url)
     if(request.url.match("/login") )
        { 

          app.postForm(request, function(err,body){
              if(err){console.log(err);return;}
              serverClass.login(function(err,user){
                if (err) {
                  console.log(err);
                  return;
                }
                console.log('POST2',err,user)
                if (!user) {
                  let content = ejs.render(fs.readFileSync(filePath, 'utf8'), {filename: 'login',  user: undefined, message: "Укажите правильный " + (mode=="AD"?"логин":"email") + " или пароль!", SelForm: 'formlogin', notUser: undefined,mode: mode});
                  app.Render(response,content,contentType);

                  return;
                }
                else
                _user = user;
                 request.logIn(user);
                
                console.log('login', mySession.data.user, mySession.id);

                // commands['usersOnline'](function( _usersOnline){usersOnline =_usersOnline;},usersOnline,server.clients)
                // console.log('пользователи онлайн login',usersOnline);
               // if(user)
                {
                  // if(usersOnline.findIndex(x => x && x.id==user.id) ===-1)
                  if(usersOnline.indexOf(x => x && x.id==user.id) ===-1)
                {usersOnline.push(JSON.parse(user));}
                console.log('usersOnlinePush',usersOnline)
                response.redirect(process.env.port ? "/Messager/server.js": "/");}
              },body,mySession,mode)
          })
        } else
    if(request.url == "/change")
    {
      app.postForm(request, function(err,body)
      {
        if(err){console.log(err);return;}
      
        serverDB.change(function(err,user,msg){
          //console.log('serverClass.login',user);
          if (err) {
            console.log(err);
            return;
          }
          let content ;
          if (!user) {
              content = ejs.render(fs.readFileSync(filePath, 'utf8'), {filename: 'login',  user: undefined, message: msg, SelForm: 'formchange', notUser: body,mode: mode});
            console.log('content',contentType);
            app.Render(response,content,contentType);
              return;
          }
          else
          {
              content = ejs.render(fs.readFileSync(filePath, 'utf8'), {filename: 'login',  user: user, message: msg, SelForm: 'formchange', notUser: undefined,mode: mode});
            console.log('content',contentType);
            app.Render(response,content,contentType);

          }
        },body.email,body.password,body.password1,body.password2,)

      })
        } else
    if(request.url == "/register")
    {
      app.postForm(request, function(err,body)
      {
        if(err){console.log(err);return;}
      
        serverDB.register(function(err,user,msg){
          //console.log('serverClass.login',user);
          if (err) {
            console.log(err);
            return;
          }
          let content;
          if (!user) {
              content = ejs.render(fs.readFileSync(filePath, 'utf8'), {filename: 'login',  user: undefined, message: msg, SelForm: 'formregister', notUser: body,mode: mode});
            console.log('content',contentType);
            app.Render(response,content,contentType);
              return;
          }
          else
          {
            console.log('formregisterRender');
              content = ejs.render(fs.readFileSync(filePath, 'utf8'), {filename: 'login',  user: user, message: msg, SelForm: 'formregister', notUser: body,mode: mode});
            console.log('content',contentType);
            app.Render(response,content,contentType);

          }
        },body.email,body.login,body.username,body.password1,body.password2)

      })
        }
  }
  else
 { 
  //console.log('nen',filePath);
   fs.readFile(filePath, function(error, content) {
   // console.log('nen222');
      if (error) {
       // console.log('nenerr');
          if(error.code == 'ENOENT') {
              fs.readFile('./404.html', function(error, content) {
                  response.writeHead(404, { 'Content-Type': 'text/html' });
                  response.end(content, 'utf-8');
              });
          }
          else
           {
              response.writeHead(500);
              response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
          }
      }
      else 
      {
        //console.log('nen0');
                  if(filePath.match('ejs'))
            {   
                content = ejs.render(fs.readFileSync(filePath, 'utf8'), {filename: 'login',  user: undefined, message: ' ' , SelForm: 'formlogin', notUser: undefined,mode: mode});
            }
            app.Render(response,content,contentType);

      }
  });
}
}
function onRequest(req, res)  {

  if (req.url.startsWith('/') || req.url.startsWith('/login') ) {
    res.redirect = function(location)
        {   
          res.writeHead(302,  {Location: location})
          res.end();
        }
        if(!req.cookies)
        {req.cookies = [];}
        
    handleGreetRequest(req, res);
  } else {
    res.statusCode = 404;
    res.end('Страница не найдена.');
  }
};

///WebSocket

//let cookie_date = new Date().toGMTString(); 
const server =  new webSocket.Server({
  server: serverHttp,
 // port,
    verifyClient: (info, done) => {
    done(mySession);
  },
  noServer: false
});

let _idChat = 0;

server.on("connection", function(ws, request) {
  let commands = {
      //добавление/изменение пользователей в чате
    insertUserInChat: serverClass.insertUserInChat,
     //выбор пользователей в чате
    checkUsersInChat:  serverClass.checkUsersInChat,
    //история чата
    History:  serverClass.History,
    //фильтр пользователей
    getFilterUsers:  serverClass.getFilterUsers,
    //сохранение сообщений
    saveMessage:  serverClass.saveMessage,
    //пользователи онлайн
    usersOnline: serverClass.usersOnline,
    };

  //commands.insertUserInChat=  serverClass.insertUserInChat;
 


   ws.on("message", message => {

     message = JSON.parse(message);
     console.log('messageServer',message, usersOnline,server.clients.size);
     //закрытие сокета с клиента вводом строки exit
     if (message.value === "exit") {
       ws.close();
       console.log("Exit " + server);
      } 
     else   
    //обработка действий клиента
     if (message.sys === "Yes") 
     {
      commands[message.act](function(err, idChat,wsSend) {

       if(err){console.log('err',message.act,err);}
        if(idChat) { _idChat = idChat;} else {_idChat=0;}
        if(wsSend) 
         {
          console.log('usersOnlineSend',usersOnline)

          if (message.act == 'getFilterUsers')
               {
                wsSend = JSON.parse(wsSend); 
                 wsSend.usersOnline = usersOnline; 
                 wsSend.idChat= _idChat;
  
                 wsSend = JSON.stringify(wsSend); 
               }
       //        console.log('wsSend',wsSend)
               ws.send(wsSend);
        //       console.log('ws.send3')
        }
      },message, _idChat,ws.user.id,mode);
    } 
    //рассылка сообщений пользователям
    else 
    {
         server.clients.forEach(client => {
         if (client.readyState === webSocket.OPEN) {
          console.log('рассылка сообщений пользователям',message, client.user,server.clients.size);
            if ( client.user && (message.online || client.user.id == ws.user.id || message.usersSend.split(',').findIndex(x => x==client.user.id)  !=-1)) 
                {  
                  console.log('рассылка', client.user.id);
                client.send(
                  JSON.stringify({
                    cell: "form",
                    message
                  })
                );
                console.log('ws.send4')
                }
         }
       });
       //сохранение сообщений 
       if(!message.online )
       {
       //console.log('Я тут saveMessage!!');
       commands['saveMessage'](function(err,all)
       {
          console.log('saveMessage!!!!!!!!!!!!!!!!!!!!!!!!!');
         if(err){
                 console.log('err',err);
                 return;
               }
              },message,ws.user.id);
       }

     }
    console.log('server.clients.size',server.clients.size);
 
   });
   //закрытие сокета
   ///console.log("закрытие сокета!!!!!!!!");
   ws.on("close", function() {
     console.log("закрытие сокета!!!!!!!!!");
     if(ws.user)
    {
      try
      {
        commands['usersOnline'](function( _usersOnline){usersOnline =_usersOnline;},usersOnline,server.clients)
        console.log('пользователи онлайн splice',usersOnline);
       request.logout();
       mySession = null; 
       ws.user = null;
       _user = null;
      }
      catch
      {}
    }
   });

   ws.on ("error", (error) => {
            if (error.code != "ECONNRESET") {
                  throw error;
             }
             else{
              console.log("ECONNRESET" + error);
             }
        });
  

  if(_user)ws.user =_user ;
    //пользователь зашел
    if (ws.user)
    {
      ws.send(
        JSON.stringify({
          cell: "user",
          user: ws.user
        //   ,
        //  clients: JSON.stringify(server.clients)
        }));
        //пользователи онлайн
        commands['usersOnline'](function( _usersOnline){usersOnline =_usersOnline;},usersOnline,server.clients)
        console.log('пользователи онлайн',usersOnline);
      }
    //заполнение таблицы пользователей
    //console.log('getFilterUsers1',mode);
    commands['getFilterUsers'](function(err, idChat,wsSend) {
     // console.log('getFilterUsers2',mode);
      if(err){return;}
        if(idChat)  _idChat = idChat;
        if(wsSend) 
        {
                wsSend = JSON.parse(wsSend); 
                wsSend.usersOnline = usersOnline; 
                wsSend.idChat= _idChat;
                wsSend = JSON.stringify(wsSend); 
                
              ws.send(wsSend);
             // console.log('ws.send2',wsSend)
        }
      },null,_idChat?_idChat:0, (ws.user?ws.user.id:0),mode);

 });


serverHttp.listen(porthttp, function() {
  console.log(`Listening on http://${HOST}:${porthttp}`);
});
