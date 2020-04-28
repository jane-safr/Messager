const status1 = document.getElementById("status");
const logout = document.getElementById("logout");
const welcome = document.getElementById("welcome");
const form = document.getElementById("form");
const input = document.getElementById("input");

let user: {fio: string,id:string }= null;
const HOST =  window.location.host +window.location.pathname; //'localhost:' +  8125;
let cellsUsers =[];
let checkboxes =[];
var ws = new WebSocket("ws://" + HOST);

function setStatus(value) {
  status1.innerHTML = "Статус: "+ value;
  (<HTMLLinkElement>logout).href = "http://"+HOST + '/logout';  (<HTMLLinkElement>welcome).href = "http://"+HOST + '/login'; 

}

function printMessage(value) {
  console.log('value',value);
  const change = JSON.parse(value);
  console.log('change',change);
  //Аутентификация в index.html
  if (change.cell == 'user')
  {

    if(change.user)
    {
      user= change.user;
      welcome.innerHTML =  user.fio;
      logout.innerHTML =   ' Выйти';

    }
    else
    {logout.innerHTML = 'Войти'; welcome.innerHTML = ''; }
    return;
  }
  if(change.message.online =="No" && change.message.cell == user.id)
  {welcome.innerHTML =  welcome.innerHTML + " в другой сессии";}
  if(!user){return;}

  let commands = {
      //зашел пользователь; получение сообщений
    form: forms,
    // История сообщений
    History: History1,
    //список пользователей
    users:  users,
    //отметить пользователей в чате
    checkUsersInChat: checkUsersInChat,
    //фильтр с учетом регистра
    getFilterUsers:  users

  };

 

  commands[change.cell](change.message,user.id,change);

  }


//отправление сообщения
form.addEventListener("submit", e => {
  e.preventDefault();
  let checkboxes = document.getElementsByTagName('input');
  let usersSend=  Array.prototype.slice.call(checkboxes).filter(ch => ch.checked==true && ch.name>0 ).map(ch => ch.name).join();
  let idChat = - Array.prototype.slice.call(checkboxes).filter(ch => ch.checked==true && ch.name<0 ).map(ch => ch.name)[0];
  ws.send(
    JSON.stringify({
      cell:   (event.target),// (event.target).id,
      value: (<HTMLInputElement>input).value,
      userFrom: user,
      userTo: id,
      usersSend: usersSend,
      idChat: idChat?idChat:0
    })
  );
  (<HTMLInputElement>input).value = "";
});


ws.onopen = () => setStatus("В сети");

ws.onclose = () => {setStatus("Отключен");  cellsUsers['' + user.id].children[0].src ='' ; }

ws.onmessage = response => 
printMessage(response.data);

let index;
// выделение сообщений в истории
function getSelectedRowHis() {
  let table = <HTMLTableElement>document.getElementById("messagesHistory");
  for (let i = 1; i < table.rows.length; i++) {
    table.rows[i].onclick = function() {

      if (typeof index !== "undefined") {
        table.rows[index].classList.toggle("selected");
      }

      index = table.rows[index].rowIndex;
      table.rows[index].classList.toggle("selected");
      // index = this.rowIndex;
      // this.classList.toggle("selected");

    };
    
  }
}


window.addEventListener('beforeunload', function() {
  if (user)
  ws.send(JSON.stringify({
    online: 'No',
    cell: '' + user.id,
  }));
});

function myFilter(e) {

  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value; //.toUpperCase();
  if (e.keyCode == 13) 
  { 

  ws.send(
    JSON.stringify({
      sys: "Yes",
      act: "getFilterUsers",
      strFilter: filter
      // ,
      // userFrom: user
    })
  );
  return false;}

  // table = document.getElementById("tableUsers");
  // tr = table.getElementsByTagName("tr");

  // // Loop through all table rows, and hide those who don't match the search query
  // for (i = 0; i < tr.length; i++) {
  //   td = tr[i].getElementsByTagName("td")[3];
  //   if (td) {
  //     txtValue = td.textContent || td.innerText;
  //     if (txtValue.toUpperCase().indexOf(filter) > -1) {
  //       tr[i].style.display = "";
  //     } else {
  //       tr[i].style.display = "none";
  //     }
  //   }
  // }
}

function myFilterStyle() {
  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("tableUsers");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[3];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

function myFilterHis() {
  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInputHis");
  filter = input.value.toUpperCase();
  table = document.getElementById("messagesHistory");
  tr = table.getElementsByTagName("li");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
const myInput = document.getElementById("addChat");
// добавление пользователей в чат
function myAddChat(){
  let chat =(<HTMLInputElement>myInput).value;
  if(chat =='') return;
  if(id=="0"){alert('Пользователь не выбран!'); return;}

 let  checkboxes = document.getElementsByTagName('input');

let selectedCboxes =  Array.prototype.slice.call(checkboxes).filter(ch => ch.checked==true).map(ch => ch.name);
//return;
 // let row =
 ws.send(
  JSON.stringify({
    sys: 'Yes',
    act: 'insertUserInChat',
  //idUser: id,
  chat: chat,
  usersAddChat: selectedCboxes
  })
);
}

