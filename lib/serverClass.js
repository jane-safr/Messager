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
function(cb, message,idChat,userId)
{
 //console.log("serverClass.getFilterUsers",userId);
 serverDB.getFilterUsers(function(err, all) {
  if (err) {
   console.log("err getFilterUsers1",err);
   cb(err,null);
  }
  let wsSend =
      JSON.stringify({
       cell:  "users",
       message:  all
     })
 
   cb('',null,wsSend);
 },userId,message==null?'':message.strFilter);

},
login:
function(cb,email,password,idSession)
{
//console.log('Я тут!',email,password,idSession);
 serverDB.login(email,password,idSession,function(err, all) {
  if (err) {
   console.log("err login",err);
   cb(err,null);
  }
 //console.log('Я тут!all',all);

  let wsSend =
      JSON.stringify({
       id:     all.id,
       email:  all.email,
       login:  all.login,
       fio:   all.fio

     })
 
   cb('',all?wsSend:false);
 });

},
// getFilterUsersOld:
// function(cb, message)
// {

//  serverDB.getFilterUsers(function(err, all) {

//   if (err) {
//    console.log("err getFilterUsers");
//    cb(err,null);
//   }
//   let wsSend =
 
//      JSON.stringify({
//        cell:  "getFilterUsers",
//        all:  all

//      })
 
//    cb('',null,wsSend);
//  },message.userFrom.id,message.strFilter);

// },
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
      }

}