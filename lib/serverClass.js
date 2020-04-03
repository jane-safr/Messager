let serverDB = require("./serverDB");
module.exports =
{
  //добавление пользователей в чат
insertUserInChat: function(cb,message, _idChat,_user)
{
  let date = new Date();
  let sqllite_date = date.toISOString();
  _idChat = -Array.prototype.slice.call(message.usersAddChat).filter(ch =>  ch < 0)[0];
  console.log('_idChat',_idChat)
  let row = JSON.stringify({
    idUser: message.idUser,
    chat: message.chat,
    dateAdd: sqllite_date,
    idUserFrom: _user.id,
    usersAddChat: message.usersAddChat,
    idChat: _idChat
  });
  serverDB.insertUserInChat(function(err,idChat ) {
    if (err) {
                console.log('err',err);
                cb(err,0,null);
              }
  cb('',idChat);
  },row);
},
//выбор пользователей в чате
checkUsersInChat:
function(cb, message)
{
console.log("checkUsersInChatStart");
 serverDB.getUsersInChat(function(err, all) {
  if (err) {
   console.log("checkUsersInChat");
   cb(err,null);
  }
  let wsSend =
 
     JSON.stringify({
       cell:  "checkUsersInChat",
       message:
        { usersInChat:  all,
        idChat: message.idChat}
     })
 
   _idChat = - message.idChat;
   //console.log("checkUsersInChatFinish",message.idChat);
   cb('',- message.idChat,wsSend);
 },message.idChat);},
 History:
 function(cb, message,idChat,idUser)
 {
  console.log("HistoryStart");
  serverDB.getHistory(function(err, all) {
   if (err) {
    console.log("History");
    cb(err,null);
   }
   let wsSend =
  
      JSON.stringify({
        cell:  "History",
        message:
         {  History:  all    }
      })
  
    _idChat = - message.idChat;
   // console.log("checkUsersInChatFinish",message.idChat);
    cb('',- message.idChat,wsSend);
  },idUser,message.usersSend,message.idChat);

},
getFilterUsers:
function(cb, message,idchat,userId,mode)
{
 console.log("serverClass.getFilterUsers",userId,message==null?'':message.strFilter,mode);
 serverDB.getFilterUsers(function(err, all) {
  if (err) {
   console.log("err getFilterUsers1",err);
   cb(err,null);
  }
  console.log(" serverDB.getFilterUsers",message,all);
  let wsSend =
      JSON.stringify({
       cell:  "users",
       message:  all
     })
 
   cb('',null,wsSend);
 },userId,message==null?'':message.strFilter,mode);

},
usersOnline:
function (cb,usersOnline,clients) {
  usersOnline=[];
    clients.forEach(client => {
    if(client.user)   usersOnline.push(client.user);})
      cb(usersOnline);
}
,
login:
function(cb,user,Session,mode)
{
console.log('Я тут!',user,Session,mode);
let all; let SessionId = Session?Session.id:null
if(mode =="DB")
{
  serverDB.login(user,SessionId,mode,function(err, _all) {
    all = _all;
    send(err,all);
    });
}
else
if(mode =="AD")
{
  let AD = require("./AD");
  if(Session)
  {
    AD.login( user,Session,function(err,_all)
  {
    all= _all;
    console.log('_all',_all)
    send(err,all);
  }
    )
  }
  else
  {
    serverDB.login(user,null,'AD',function(err, _all) {
      console.log('_all',_all);
      // all = _all;
      // send(err,all);
      });
  }
}
let wsSend;
function send(err,all)
{ 
  if (err) {
    console.log("err login",err);
    cb(err,null);
  }
  //console.log(err,all);
  if(all)
  wsSend =
  JSON.stringify({
  id:     all.id,
  email:  all.email,
  login:  all.login,
  fio:   all.fio,
  GUID: all.GUID
})
console.log('wsSend',wsSend)
cb('',all?wsSend:false);
}


},

//сохранение сообщений
saveMessage:
function(cb, message,userId)
{
  let date = new Date();
  let sqllite_date = date.toISOString();
  
  let row =
        JSON.stringify({
        Message: message.value,
        idUserFrom: userId,
        idUserTo: message.userTo,
        usersSend: message.usersSend,
        idChat: message.idChat,
        dateMessage: sqllite_date
        });
    //   console.log('message.value',message.value,row);
     if(message.value && message.value!='')
     {   serverDB.insertMessage(function(err,all ) {
       if(err){
                console.log("saveMessage",err);
               return cb(err,null);
              }
       //   console.log('all',all);
         cb('',all);
        },row);}
      },
//сохранение сообщений
loginFromSession:
function(cb, mySessionId,_user,mode)
{      
  let msg= '';
  if(mode =='DB')
  {    serverDB.loginFromSession(mySessionId,function(err, all) {
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
            
          }
          else 
          {
            msg ="Сессия не найдена " +_user;
            if(mySessionId) {console.log(Date(),"Сессия не найдена",mySessionId);}
            _user = null;
          }
        })
        cb(err,_user);
  }
}
}