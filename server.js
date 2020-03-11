const port = process.env.port || 7000;
const HOST = 'localhost';
const WebSocket = require("ws");
let fs = require('fs');
 let path = require('path');
 let app = require('./lib/myExpress');
let ejs = require('ejs');
let serverDB = require("./lib/serverDB");
let serverClass = require("./lib/serverClass");
let  session = require('./sessions/core').magicSession();



let mySession;
let _user;
let usersOnline=[];

const handleGreetRequest = (request, response) => {
  //сессия
  mySession = request.session;
  serverDB.loginFromSession(mySession.id,function(err, all) {
    if (err) {
     console.log("err loginFromSession",err);
     cb(err,null);
    }
    if(all)
    {    _user =
      {
        id:     all.id,
        email:  all.email,
        login:  all.login,
        fio:   all.fio
        };
        if(mySession) {console.log("Сессия найдена",_user.fio,mySession.id);}
      }
      else 
      {
        console.log("Сессия не найдена",_user);
       if(mySession) {console.log("Сессия не найдена",mySession.id);}
      _user = null;
      }
    })
    request.logIn(_user);


  //разборка/определение url

let filePath = '.' + request.url;
 let extname = String(path.extname(request.url)).toLowerCase();
 console.log('filePath',filePath);

 //выход
 if(filePath.includes('logout')) 
 { mySession = null; 
   request.logout();
   if(_user)
      {          serverClass.login(function(err,user){
              if (err) {
                console.log(err);
                return;
              }
            },_user.email,null,null)}
  console.log('logout', request.session.data.user,_user);
   }
  filePath = app.dispatch(request.url,extname);


if(request.session.data.user)
{
     _user = JSON.parse(request.session.data.user);
    // console.log('request.session.data.user',request.session.data.user,'_user' ,_user );
  }
 
   extname = String(path.extname(filePath)).toLowerCase();
   //console.log( 'extname', extname);
   let contentType = app.mimeTypes[extname] || 'text/html; charset=utf-8';

//POST login
    if (request.method === 'POST') {
     if(request.url == "/login")
        { 
          app.postForm(request, function(err,body){
              if(err){console.log(err);return;}
              serverClass.login(function(err,user){
                if (err) {
                  console.log(err);
                  return;
                }
                if (!user) {
                  content = ejs.render(fs.readFileSync(filePath, 'utf8'), {filename: 'login',  user: undefined, message: "Укажите правильный email или пароль!", SelForm: 'formlogin', notUser: undefined});
                  app.Render(response,content,contentType);

                  return;
                }
                else
                _user = user;
                 request.logIn(user);
                
                console.log('login', mySession.data.user, mySession.id);

                if(usersOnline.findIndex(x => x.id==user.id) ===-1)
                {usersOnline.push(JSON.parse(user));}
                console.log('usersOnlinePush',usersOnline)
                response.redirect("/");
              },body.email,body.password,mySession.id)
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

          if (!user) {
              content = ejs.render(fs.readFileSync(filePath, 'utf8'), {filename: 'login',  user: undefined, message: msg, SelForm: 'formchange', notUser: body});
            console.log('content',contentType);
            app.Render(response,content,contentType);
              return;
          }
          else
          {
              content = ejs.render(fs.readFileSync(filePath, 'utf8'), {filename: 'login',  user: user, message: msg, SelForm: 'formchange', notUser: undefined});
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

          if (!user) {
              content = ejs.render(fs.readFileSync(filePath, 'utf8'), {filename: 'login',  user: undefined, message: msg, SelForm: 'formregister', notUser: body});
            console.log('content',contentType);
            app.Render(response,content,contentType);
              return;
          }
          else
          {
            console.log('formregisterRender');
              content = ejs.render(fs.readFileSync(filePath, 'utf8'), {filename: 'login',  user: user, message: msg, SelForm: 'formregister', notUser: body});
            console.log('content',contentType);
            app.Render(response,content,contentType);

          }
        },body.email,body.login,body.username,body.password1,body.password2)

      })
        }
  }
  else
 { 
   fs.readFile(filePath, function(error, content) {
      if (error) {
          if(error.code == 'ENOENT') {
              fs.readFile('./404.html', function(error, content) {
                  response.writeHead(404, { 'Content-Type': 'text/html' });
                  response.end(content, 'utf-8');
              });
          }
          else {
              response.writeHead(500);
              response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
          }
      }
      else 
      {
                  if(filePath.includes('ejs'))
            {   
                content = ejs.render(fs.readFileSync(filePath, 'utf8'), {filename: 'login',  user: undefined, message: ' ' , SelForm: 'formlogin', notUser: undefined});
            }
            app.Render(response,content,contentType);

      }
  });
}
}
const onRequest = (req, res) => {
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

let cookie_date = new Date().toGMTString(); 
const server =  new WebSocket.Server({
  port,
    verifyClient: (info, done) => {

    done(mySession);

  },

  noServer: false
});

let _idChat = 0;

server.on("connection", function(ws, request) {
  let commands = {};
  //добавление/изменение пользователей в чате
  commands.insertUserInChat=  serverClass.insertUserInChat;
  //выбор пользователей в чате
  commands.checkUsersInChat=  serverClass.checkUsersInChat;
  //история чата
  commands.History=  serverClass.History;
  //фильтр пользователей
  commands.getFilterUsers=  serverClass.getFilterUsers;
  //сохранение сообщений
  commands.saveMessage=  serverClass.saveMessage;

   ws.on("message", message => {

     message = JSON.parse(message);
     console.log('messageServer',message);
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
               ws.send(wsSend);
        }
      },message, _idChat,ws.user.id);
    } 
    //рассылка сообщений пользователям
    else 
    {
         server.clients.forEach(client => {
         if (client.readyState === WebSocket.OPEN) {
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
        // console.log(  'usersOnlineBefore',usersOnline);
       usersOnline.splice( usersOnline.findIndex(x => x.id==ws.user.id), 1 );
      //  console.log(  'usersOnlineAfter',usersOnline);
      //  console.log('request.logout()')
       request.logout();
       mySession = null; 
       ws.user = null;
       _user = null;
      }
      catch
      {}
    }
   });

//console.log('if(_user)ws.user =_user',_user, ws.user)
  if(_user)ws.user =_user ;
    //пользователь зашел
    if (ws.user)
    {
      ws.send(
        JSON.stringify({
          cell: "user",
          user: ws.user
        }));
        //добавление пользователя в usersOnline, если его там нет
        if(usersOnline.findIndex(x => x.id==ws.user.id) ===-1)
        {usersOnline.push(ws.user);
          console.log('usersOnlinePushWS',usersOnline)}
    }
    //заполнение таблицы пользователей
    commands['getFilterUsers'](function(err, idChat,wsSend) {
      if(err){return;}
        if(idChat)  _idChat = idChat;
        if(wsSend) 
        {
                wsSend = JSON.parse(wsSend); 
                wsSend.usersOnline = usersOnline; 
                wsSend.idChat= _idChat;
                wsSend = JSON.stringify(wsSend); 
              ws.send(wsSend);
        }
      },null, _idChat,(ws.user?ws.user.id:0));

 });


const serverHttp = require("http").createServer(onRequest);

serverHttp.listen(8125, function() {
  console.log(`Listening on http://${HOST}:8125`);
});
