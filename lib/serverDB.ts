declare function require(path: string): any;
const sqlite3 = require("sqlite3").verbose();
let _path =  "C:\\sqlite3\\users.db";

let sdb ={

getUsersSQLite: function(callback,userId) {
  console.log('getUsersSQLite');
  let db = new sqlite3.Database(_path);
  db.all("select id,login , fio, email,2 as nomOrder  from users union all select distinct -id, '',chat,'', 1 as nomOrder from chats where id in (select idChat from userInChat where idUser = " + userId +") order by nomOrder, fio ;", function(err, all) {
      callback(err, all);  
  });
  db.close();
}
,
insertUser: function(callback,userDB) {
  //console.log('insertUser',userDB, callback);
  // console.log(`INSERT OR IGNORE INTO users (email, login, fio, password,GUID) values (?, ?, ?, ? ,?); select id from users where login = ?;`, [userDB.email, userDB.login, userDB.fio, userDB.password, userDB.GUID,userDB.login]);
  let db = new sqlite3.Database(_path);
  db.run(`INSERT OR IGNORE INTO users (email, login, fio, password,GUID) values (?, ?, ?, ? ,?);`, [userDB.email, userDB.login, userDB.fio, userDB.password, userDB.GUID], function(err) {
    if (err) {
      console.log(err);
     return callback(err, null); 
    }
    db.get("SELECT id FROM users WHERE login = ?", [userDB.login],
    function(err, row){
    if(err){
    console.log('err',err);
    return callback(err, null); 
    }
    userDB.id = row.id;
    return callback(err, userDB); 
  })
  
})
db.close();
}
,
insertMessageOld: function(callback,row) {
 
  row = JSON.parse(row);
 
 // console.log('insertMessage',row["idUserFrom"], row.idUserTo, row.dateMessage, row.Message,row.usersSend);
 console.log('row.idChat',row.idChat);
  let db = new sqlite3.Database(_path);
  if(row.idChat && row.idChat != 0)
  {

    console.log(`INSERT INTO userMessage (idUserFrom, idUserTo, dateMessage, Message) select ?, id, ?, ? from users where id in (`+row.usersSend+`)`, [row.idUserFrom, row.dateMessage, row.Message]);

  db.run(`INSERT INTO userMessage (idUserFrom, idUserTo, dateMessage, Message) select ?, id, ?, ? from users where id in (`+row.usersSend+`)`, [row.idUserFrom, row.dateMessage, row.Message], function(err) {
    if (err) {
      console.log('err1',err)
      callback(err, null); 
    }
    console.log('this.lastIDChatNot', this.lastID)
    callback(err, this.lastID);  
})
  }
  else
  {
    console.log(`INSERT INTO userMessage (idUserFrom, idUserTo, dateMessage, Message) select ?, id, ?, ? from users where id in (`+row.usersSend+`)`, [row.idUserFrom, row.dateMessage, row.Message]);
      db.run(`INSERT INTO userMessage (idUserFrom, idUserTo, dateMessage, Message) select ?, id, ?, ? from users where id in (`+row.usersSend+`)`, [row.idUserFrom, row.dateMessage, row.Message], function(err) {
        if (err) {
          console.log('err2',err)
          callback(err, null); 
        }
        console.log('this.lastIDChatNot', this.lastID)
        callback(err, this.lastID);  
    })
  }
db.close();
},
insertMessage: function(callback,row) {
 
  row = JSON.parse(row);
 
 // console.log('insertMessage',row["idUserFrom"], row.idUserTo, row.dateMessage, row.Message,row.usersSend);
 console.log('row.idChat',row.idChat);
  let db = new sqlite3.Database(_path);
  if(row.idChat && row.idChat != 0)
  {

    console.log(`INSERT INTO userMessage (idUserFrom, idUserTo, dateMessage, Message, idChat) select ?, idUser, ?, ?,$idChat from userInChat where id in (`+row.usersSend+`)`, );

      db.run(`INSERT INTO userMessage (idUserFrom, idUserTo, dateMessage, Message, idChat) select ?, id, ?, ?,$idChat from users where id in (`+row.usersSend+`)`,  function(err) {


      callback(err, this.lastID);  
  })
  }
  else
  {
    console.log(`INSERT INTO userMessage (idUserFrom, idUserTo, dateMessage, Message) select ?, id, ?, ? from users where id in (`+row.usersSend+`)`, [row.idUserFrom, row.dateMessage, row.Message]);
      db.run(`INSERT INTO userMessage (idUserFrom, idUserTo, dateMessage, Message) select ?, id, ?, ? from users where id in (`+row.usersSend+`)`, [row.idUserFrom, row.dateMessage, row.Message], function(err) {
        if (err) {
          console.log('err2',err)
          callback(err, null); 
        }
        console.log('this.lastIDChatNot', this.lastID)
        callback(err, this.lastID);  
    })
  }
db.close();
},
insertUserInChat: function(callback,row) {
  row = JSON.parse(row);
  console.log('insertUserInChat', row);

  let db = new sqlite3.Database(_path);
////проверка
let chat = row.chat;
//let idChat=-Array.prototype.slice.call(row.usersAddChat).filter(ch =>  ch < 0)[0];
let idChat= row.idChat;
let usersInChat =Array.prototype.slice.call(row.usersAddChat).filter(ch =>  ch > 0).join();

console.log('!idChat',!idChat)
if(!idChat){
    console.log('!idChat1',!idChat)
  db.run(`INSERT  INTO chats ( chat) values (?)`, [ chat], function(err,idChat) {
    console.log('000');
    if (err) {
      console.log('err',err)
      callback(err, null); 
    }
    idChat= this.lastID; 
    console.log('idChat2',idChat,`INSERT OR IGNORE INTO userInChat (idUser, idChat, dateAdd) values (?, ?, ?)`, [ row.idUserFrom,idChat, row.dateAdd]);
    
    db.run(`INSERT OR IGNORE INTO userInChat (idUser, idChat, dateAdd) values (?, ?, ?)`, [ row.idUserFrom,idChat, row.dateAdd], function(err) {
      if (err) {
        callback(err, null); 
      }
      usersInChat=usersInChat+ "," + row.idUserFrom;
      console.log('newChat', this.lastID)
      RefChat(db,idChat,row,usersInChat,callback);
      callback(null, idChat); 
    })
  })
}
else
{
  RefChat(db,idChat,row,usersInChat,callback);
  callback(null, idChat); 
 }

db.close();
},
getUsersInChat: function(callback,idChat) {
  console.log('getUsersInChat');
  let db = new sqlite3.Database(_path);
  db.all("select id from users where id in(select idUser from userInChat where idchat = ?);",-idChat, function(err, all) {
      callback(err, all);  
  });
  db.close();
},
getHistory: function(callback,idUser,usersSend,idChat) {
  console.log('getHistory');
  let strWhere;
  if(idChat && idChat != 0)
    {
      strWhere = " where userMessage.idChat = " + idChat;
     
    }
  else
    {strWhere = "  where  userMessage.idUserFrom in ("+usersSend+") or userMessage.idUserTo in ("+usersSend+") and chats.id is null";}    
  let db = new sqlite3.Database(_path);
  strWhere =  "select distinct userMessage.idUserFrom,userMessage.dateMessage,userMessage.Message,userFrom.fio as fioFrom, chats.chat from userMessage inner join users as userFrom on userMessage.idUserFrom =  userFrom.id left outer join chats  on userMessage.idChat = chats.id "+strWhere+";";
  console.log('strWhere',strWhere);
  db.all(strWhere, function(err, all) {
      callback(err, all);  
  });
  db.close();
},
delHistory: function(callback,mesHistory) {
  console.log('delHistory');
  let strWhere;
  // if(idChat && idChat != 0)
  //   {
  //     strWhere = " where userMessage.idChat = " + idChat;
     
  //   }
  // else
  //   {strWhere = "  where  userMessage.idUserFrom in ("+usersSend+") or userMessage.idUserTo in ("+usersSend+") and chats.id is null";}    
  let db = new sqlite3.Database(_path);
  strWhere =  " from userMessage where id in  ("+mesHistory+")";
  console.log('strWhere',strWhere);

  db.run(strWhere, function(err, all) {
    if (err) {
      console.log('err',err)
      callback(err, null); 
    }
      callback(null, this.changes);  
  });
  //db.close();
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
  });
},
getFilterUsers: function(callback,userId,strFilter,mode) {
  //console.log('getFilterUsers',userId,mode);
  let db = new sqlite3.Database(_path);
  let strMode  = mode=='AD'? " and password == 'AD' ":" and password != 'AD' ";
  //console.log( 'strMode', strMode);
  console.log('strFilter',userId,strFilter,mode,"select id,login ,  fio, email,2 as nomOrder  from users where fio like '%" + strFilter + "%' "+ strMode +" union all select distinct -id, '',chat,'', 1 as nomOrder from chats where id in (select idChat from userInChat where idUser = " + userId +") order by nomOrder, fio ;");
  db.all("select id,login ,  fio, email,2 as nomOrder  from users where fio like '%" + strFilter + "%' "+ strMode +" union all select distinct -id, '',chat,'', 1 as nomOrder from chats where id in (select idChat from userInChat where idUser = " + userId +") order by nomOrder, fio ;", function(err, all) {
      callback(err, all);  
  });
  db.close();
},
login: function( _user,idSession,mode, done){
    
    let strLogin = mode=='DB'?  _user.email.substring(0, _user.email.indexOf('@')):_user.login;
    console.log('login',strLogin );
    let db = new sqlite3.Database(_path);
    db.get("SELECT * FROM users WHERE login = ? ", [strLogin],
  function(err, row){
    if(err){
    console.log('err',err);
    return done(err);
    }
    console.log("SELECT * FROM users WHERE login = ? ", [strLogin],row);
    if(!row){
      console.log('Incorrect login '+ strLogin);
    return done(null, false);
    }
  console.log(`Запись в базу сессии ?  пользователю ?`, [idSession,strLogin]);
    db.run(`UPDATE users SET idSession = ?  where login = ?`, [idSession,strLogin], function(err) {
      if (err) {
         console.log('err update session',err.message);
      }
    })
  if(_user.password == null)return done(null, false);

    if(row.password!=_user.password)
    { console.log('Incorrect password ' + _user.password);
      return done(null, false);}

    let user= row;
    
    return done(null, user);
    db.close();
  });
},
change: 
function( done, email,password, password1,password2){
  console.log('local-change');
  let msg='';
  if(password1!=password2)
  {
   msg ='Пароль и подтверждение пароля не совпадают!';
    console.log('msg',msg);
    return done(null, false, msg);
  }
  
  let db = new sqlite3.Database(_path);
  db.get("SELECT id,login,fio,email FROM users WHERE email = ?  and password = ? ", [email,password],
  function(err, row){
  if(err){
  console.log('err',err);
   return done(err);
  }
  //console.log(row,"SELECT * FROM users WHERE email = ? and password = ? ", [email],[password]);
  
  if(!row){
    msg ='Не правильный email или пароль! '+ email + password + ' '+ password1+ ' '+ password2;
       console.log('msg',msg);
        return done(null, false, msg);
  }
  let user = row;
  db.run(`UPDATE users SET password = ?  where email = ?`, [password1,email], function(err) {
    if (err) {
      return console.log('err.message',err.message);
    }
    msg ='Пароль изменен! ';
    console.log('msg',msg);
    return done(null, user,msg);
  })
  });
   db.close();
    },
register: 
function(done,email,login,username,password1,password2)
{
  console.log('register');
  let db = new sqlite3.Database(_path);
  db.get("SELECT * FROM users WHERE email = ? ", [email],
 function(err, row){
  let msg='';
  if(err){
  console.log('err',err);
   return done(err);
  }  else
// if(1==2)

  if(row){
    msg ='Пользователь с таким  e-mail уже существует!'+ email;
       console.log('msg',msg);
        return done(null, false, msg);
  } else
  if(password1!=password2)
  {
    msg ='Пароль и подтверждение пароля не совпадают!';
    console.log('msg',msg);
    return done(null, false, msg);
  } else
  if(email.indexOf('@')==-1)
  {
    msg ='Неправильно заведен e-mail!';
    console.log('msg',msg);
    return done(null, false, msg);
  } else
  {
   let userDB = {
      id : -1,
      login: login,
      fio: username,
      computer:'',
      email,
      password: password1
    };
    sdb.insertUser(function(err,UserDB ) {
      return done(null, userDB,'Пользователь создан');
    },userDB);
        
  }
});
},
loginFromSession: function( idSession, done){
  console.log('loginFromSession',idSession);
   let db = new sqlite3.Database(_path);
//   if(mode=='AD')
//   {
//     db.get("SELECT * FROM users WHERE idSession = ? ", [idSession],
//     function(err, row){
//      if(err){
//      console.log('err',err,_path);
//       return done(err);
//      }
//      let user= row;
     
//      return done(null, user);
//      db.close();
//     });
//   }
//   else
//   if(mode=='DB')
//{ 
    db.get("SELECT * FROM users WHERE idSession = ? ", [idSession],
  function(err, row){
   // console.log('loginFromSession1');
    if(err){
    console.log('err',err,_path);
    return done(err);
    }
    let user= row;
    console.log('loginFromSessionUser',user);
    return done(null, user);
    db.close();
  });
//}
}
}

export {sdb}
//module.exports = sdb;

function RefChat(db,idChat,row,usersInChat,callback)
{
  console.log('RefChat');
  db.run(`INSERT OR IGNORE INTO userInChat (idUser, idChat, dateAdd) select id,$idChat,$date from users where id in(`+usersInChat+`) and not id in (select idUser from  userInChat where idChat = $idChat);`,  function(err) {
    if (err) {
      console.log(err);
     callback(err, null); 
    }
    console.log('this.lastIDRefChat', this.lastID)
  });
  db.run(`DELETE from userInChat where idChat = $idChat and idUser in (select idUser from userInChat where idChat = $idChat and not idUser in (`+usersInChat+`));`, function(err) {
    if (err) {
      console.log(err);
      callback(err, null); 
    }
   // console.log('this.lastID', this.lastID)
  });
}


