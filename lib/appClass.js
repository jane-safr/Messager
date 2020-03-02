function forms(message,userId)
{
  //зашел пользователь
      if(message.online && cellsUsers[message.cell].children[0])
      {     
        cellsUsers[message.cell].children[0].src ='/img/'+(message.online =='Yes'? 'green':'red')+'.png' ;
            return;
        }
 //получение сообщений
        if( message.userFrom)
      {   
        // if((message.userTo!= 0 && (userId != message.userTo && userId != message.userFrom.id )))
        // if((message.userTo!= 0 && message.idChat ==0 && (userId != message.userTo && userId != message.userFrom.id )))
        // {return;}
          const li = document.createElement("li");
          if ( userId == message.userFrom.id) li.className = 'right';
          li.innerHTML = message.value;
          messages.appendChild(li);
          messagesHistory.appendChild(li.cloneNode(true));
    }

}

const lettersUsers = ["id","v","","ФИО"];
function start()
{
  let table = document.getElementById("tableUsers");
  table.innerHTML = '';
  //таблица пользователей

const trUsers = document.createElement("tr");

trUsers.innerHTML = lettersUsers.map(col => (`${col}` == "v"?'<td><INPUT type="checkbox"  onchange="checkAll()" name="chk[]" style="width:15px;height:15px;"/></td>':`<td  `+(`${col}` == "id"?'style="visibility:hidden;"':'')  +`>${col}</td>`) ).join("");
tableUsers.appendChild(trUsers);
}
let id=0;
function finish(idChat,userId)
{
  getSelectedRow();
  //пользователь зашел, отметить зеленым цветом
  ws.send(JSON.stringify({
    online: 'Yes',
    cell: '' + userId,
    value: cellsUsers['' + userId].value
  }));
  id = -idChat;
  if (document.getElementsByName(id)[0])
  {document.getElementsByName(id)[0].checked = 1;}
  checkChat();
}
function finishOld(message,userId)
{
  getSelectedRow();
  ws.send(JSON.stringify({
    online: 'Yes',
    cell: '' + userId,
    value: cellsUsers['' + userId].value
  }));
  id = -message.idChat;
  if (document.getElementsByName(id)[0])
  {document.getElementsByName(id)[0].checked = 1;}
  checkChat();
}

//выделение пользователя в таблице пользователей

let Chat ='';
function getSelectedRow() {
  let table = document.getElementById("tableUsers");
  let index = null;
 // console.log('getSelectedRow', table);
  for (let i = 1; i < table.rows.length; i++) {
   // console.log('ii', i);
    table.rows[i].onclick = function() {

      if (typeof index !== "undefined" && table.rows[index]) {
        table.rows[index].classList.toggle("selected");
      }

      index = this.rowIndex;
      this.classList.toggle("selected");
      id = table.rows[index].cells[0].textContent;
      Chat=table.rows[index].cells[3].textContent;

    };
    
  }
}
//выбор пользователей в чате
function checkChat()
{
  console.log('idchat',id)
  let elements = document.getElementsByName(id);

  // return;
  // let chat = document.getElementById('ФИО'+user.id).innerHTML;
  if( elements[0] && elements[0].checked)
  {
  ws.send(
    JSON.stringify({
    sys: 'Yes',
    act: 'checkUsersInChat',
    idChat: id
    }))
  }
  else
  {

    checkAll();
  }
 }

//снятие выделения пользователей в чате
 function checkAll()
{

     var checkboxes = document.getElementsByTagName('input'), val = null;    
     for (var i = 0; i < checkboxes.length; i++)
     {
         if (checkboxes[i].type == 'checkbox')
         {
             //if (val === null) val = checkboxes[i].checked;
             checkboxes[i].checked = val;
         }
     }
     document.getElementById("addChat").value='';
     ws.send(
      JSON.stringify({
      sys: 'Yes',
      act: 'checkUsersInChat',
      idUser: 0,
      idChat: 0
      }))
    // id=0;
 }
// История сообщений
//выделение пользователя в чате
 function History(message,userId)
 {
  message.History.forEach(message => {
  

      if ( userId != message.idUserFrom)
            {   let li1 = document.createElement("li");
              li1.style="font-size: 9px;font-style:italic;right;color: rgb(150, 114, 73)";
              // if ( user.id == change.messages.idUserFrom) li1.className = 'right';
              li1.innerHTML = message.fioFrom;
                messagesHistory.appendChild(li1); }

        li1 = document.createElement("li");
        if ( userId == message.idUserFrom) li1.className = 'right';
        li1.innerHTML = message.Message;
        messagesHistory.appendChild(li1); 
        li1.onclick = function() {

          if (typeof ind !== "undefined") {
            ind.classList.toggle("selected");
          }

          ind = this;
          this.classList.toggle("selected");
  
        };
      })
      }
       //отметить пользователей в чате
      function  checkUsersInChat(message)
      {
        if (document.getElementById("ФИО" + message.idChat))
       document.getElementById("addChat").value =  document.getElementById("ФИО" + message.idChat).value;
          let checkboxes = document.getElementsByTagName('input'), val = null;    
          for (var i = 0; i < checkboxes.length; i++)
          {
     
              if (checkboxes[i].type == 'checkbox')
              {
                  //if (val === null) val = checkboxes[i].checked;
                  if(message.usersInChat.findIndex(x => x.id==checkboxes[i].name) !=-1 || message.idChat == checkboxes[i].name) 
                   checkboxes[i].checked = 1;
                  else
                  checkboxes[i].checked = 0; 
              }
          }
     
      }      

//список пользователей
function users(message, userId, change)
{          usersOnline = change.usersOnline; 

  start()

          let online = false;
          message.forEach(message => {
        if(usersOnline.findIndex(x => x.id==message.id) !=-1) {online = true;} else  {online = false;} 
            createRowUsers(message.id,message.login, message.fio,online);
          })

finish(change.idChat,userId);

          }
// function usersOld(message)
// {          usersOnline = message.usersOnline; 
//           let online = false;
//           if(usersOnline.findIndex(x => x.id==message.users.id) !=-1) online = true;
//             createRowUsers(message.users.id,message.users.login, message.users.fio,online);}

const createRowUsers = (id,login, FIO,online) => {
  const trUsers = document.createElement("tr");
  trUsers.innerHTML =
    lettersUsers
        .map(col => `<td><output ` +((`${id}`).split(' ')[0]<0?'onchange="checkChat()"':'') +(`${col}` == "id"?'class="id"':'')  +` id="${col}${id}" type="text"></td>`)
      .join("");
  tableUsers.appendChild(trUsers);
  lettersUsers.forEach(col => {
    const cell = col + id;
    const input = document.getElementById(cell);
    switch (col)
    {
      case "id":
          input.value = id;
          break; 
      case "v":

          let element1 = document.createElement("input");
          element1.type = "checkbox";
          element1.name=id;
          element1.style="width:15px;height:15px;"
          input.appendChild(element1);

          break; 
      case "":
        if(id>0)
          insImg(input,(online?'green':'red'));
          break;            
      case "Login":
          input.value = login;
        break;
      case "ФИО":
          input.value = FIO;
        break;
    }
    cellsUsers[cell] = input;

  });
};

function insImg(input, name){
  if(input.children.length ==0)
  {
  let img = new Image();
  img.onload = function() {

      input.appendChild(img);
         }
         img.src = '/img/'+name+'.png'
  }
    else
    input.children[0].src ='/img/'+name+'.png' ;

  };

let abv = "Users";

function vkladki(x,y) {
var mostrar = document.getElementById(x);
var actual = document.getElementById(abv);
if(mostrar==actual) {return false;}
actual.className="skryt";
mostrar.className="vid";
abv = x;
if (x =="History")
{
  messagesHistory.innerHTML ='';
  checkboxes = document.getElementsByTagName('input');
  let usersSend=  Array.prototype.slice.call(checkboxes).filter(ch => ch.checked==true && ch.name>0 ).map(ch => ch.name).join();
  idChat = - Array.prototype.slice.call(checkboxes).filter(ch => ch.checked==true && ch.name<0 ).map(ch => ch.name)[0];
  ws.send(
    JSON.stringify({
      sys: "Yes",
      act: "History",
      usersSend: usersSend,
      idChat: idChat
    })
  );
 
}
//document.getElementById('vkladka1').style.borderBottomColor='#e1e1e1';
// if (self.ramka) ramka.style.borderBottomColor = '#e1e1e1';
// y.style.borderBottomColor = '#fff'; ramka = y;
}
//не используется
function SelUsersOnline(usersOnline) {
  let table = document.getElementById("tableUsers");


  for (let ii = 0; ii < table.rows.length; ii++) {

    if(usersOnline.findIndex(x => x.id==table.rows[ii].cells[0].textContent) !=-1)
    {

            table.rows[ii].className = 'right';
    }
  }
}


            