const ldap = require('ldapjs');
let serverDB = require("./serverDB");
let AD={
login:  function(user,sessionData,cb) {
  //let msg = '';
adminClient= ldap.createClient({
  url: sessionData.ldap.url
  });

  adminClient.bind(sessionData.ldap.dn, sessionData.ldap.passwd, function(err) {
  
    // LDAP administrator.
  
    if (err != null)
      console.log("Errorlogin: " + err);
    else
      // Search for a user with the correct UID.
      adminClient.search(sessionData.ldap.suffix, {
        scope: "sub"
        ,
        filter: "(CN=" + user.email + ")"
      }, function(err, ldapResult) {
       
        if (err != null)
        {console.log( err);return;}
        else {
          // If we get a result, then there is such a user.
          sessionData.dn ="";
          ldapResult.on('searchEntry', function(entry) {

            sessionData.dn = entry.dn;
            // When you have the DN, try to bind with it to check the password
            let userClient = ldap.createClient({
              url: sessionData.ldap.url
            });

            userClient.bind(sessionData.dn,user.password, function(err) {
              if (err == null) {
               let user =
                {
                  id:-2,
                  GUID:     entry.object.objectGUID,
                  email:  entry.object.mail,
                  login:  entry.object.cn,
                  fio:   entry.object.displayName,
                  password: 'AD'
                  };
                  console.log('ADsessionData.id',sessionData.id)
                  serverDB.insertUser(function(err,UserDB ) {
                    serverDB.login(user,sessionData.id,'AD',function(err, _all) {
                      // all = _all;
                      // send(err,all);
                      });
                      console.log('ADUser',user)
                    return cb(null, user,'Пользователь создан');
                  },user);
              } else
              cb("Не правильный  пароль для пользователя " + user.email,null) ;
            });
  
            userClient.unbind( err => {
              if(err)console.log('unbindUserClient',err);
            });
            });
            
          // If we get to the end and there is no DN, it means there is no such user.
          ldapResult.on("end", function() {
            if (sessionData.dn === "")
            cb("Неправильно введен логин или пароль " + user.email,null); 
          });
        }
       
  
      });
  });
  adminClient.unbind( err => {
    if(err)console.log('unbindAdminClient',err);
  });
}
}

module.exports = AD;