declare function require(path: string): any;
let http = require('http');
let _sessions =  require('./session');
// console.log('_sessions',_sessions)
declare var process : {
  env: {
    port: string
  }
}
let session = function( request, response, callback ){
 
 
 let session; 
   
    // проверяем текущий запрос и определяем, есть ли для него сеанс
    // сеансы определяются путем поиска request.headers ["Set-Cookie"] по хешу наших сеансов
console.log( 'sessionCore', _sessions);
 session = _sessions.lookupOrCreate(request,{
     lifetime:604800,
     ldap: {
      url: 'ldap://ad1.titan2.ru',
      dn: 'T2\\1c-ad',
      passwd: 'Qwerty1234',
      suffix: 'DC=titan2,DC=ru'
    }

    //  ,
    //  sessionID: 'u1mNwZEpCLc'
   });
// реализуем базовую историю для каждого сеанса, помните об этом, так как это может поглотить память при высокой загрузке

   if(!session.data.history) { session.data.history = []; }
   // if(session.data.history.findIndex(x => x.url==request.url) ===-1)
   session.data.history.push(request.url);

// как правило, мы установим для всех неопознанных пользователей значение «Гость»
  //  if(typeof session.data.user == 'undefined' || session.data.user == ""){
  //   session.data.user = "Guest";
  // }
// устанавливаем заголовок ответа, чтобы установить cookie для текущего сеанса
   // это сделано для того, чтобы клиент мог передавать информацию cookie для последующих запросов
  response.setHeader('Set-Cookie', session.getSetCookieHeaderValue());
 // console.log('Set-Cookie', session.getSetCookieHeaderValue());
// в дополнение к настройке объекта ответа, мы также установим новый
   // свойство по запросу "session", это сделано для того, чтобы мы могли легко
   // ссылаемся на объект сеанса в других местах
  request.session = session;

  // console.log(1);
 
 // запускаем обратный вызов для продолжения цепочки обработки запроса / ответа
  callback( request, response );
  }
  export {session};

  let magicSession = function(){

    http.createServer = function (requestListener) {
      // console.log(2);
      // Create a new instance of a node HttpServer
      var orig = new http.Server(function(request, response){
        request.logIn = function(user){

         // console.log('core_user',user,request.session.data.user);
           if(user && request.session.data.user !=JSON.stringify(user))
           { 
            
             console.log('Пользователь добавлен в сессию ',JSON.stringify(user), request.session.id);
             request.session.data.user = JSON.stringify(user);
           }
           };
        request.logout = function()    {
          console.log("Пользователь удален из сессии",request.session.data.user,request.session.id);
         request.session.data.user = null;
         //request.session = null;
        }

        session(request, response, function(request, response){
          requestListener(request, response);
          // console.log(3);
        });
        //export {session};
      });

 
      // Monkey punch the http server
      let server = Object.create(orig);
 
      server.listen = function (port,cb) { 
        //orig.listen(Number(port));
        orig.listen(process.env.port || Number(port));
        // console.log(4);
        cb();
      };
  
      return server;
    };  
  
  };
  export {magicSession};
