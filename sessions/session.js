let sessions={}, timeout;
exports.lookupOrCreate=lookupOrCreate

function lookupOrCreate(req,opts){
  let id,session
  opts=opts||{}
  // find or generate a session ID
  id=idFromRequest(req,opts)

  // if the session exists, use it
  if(ownProp(sessions,id)){
    session=sessions[id]}
  // otherwise create a new session object with that ID, and store it
  else{
    session=new Session(id,opts)
    sessions[id]=session}

  // установить время, когда сеанс может быть восстановлен
  session.expiration=(+new Date)+session.lifetime*1000
  // make sure a timeout is pending for the expired session reaper
  if(!timeout)
    timeout=setTimeout(cleanup,60000)

  return session}

  function idFromRequest(req,opts){var m
    // ищем существующий SID в заголовке Cookie, для которого у нас есть сеанс
     if(req.headers.cookie
    && (m = /SID=([^ ,;]*)/.exec(req.headers.cookie))
    //&& ownProp(sessions,m[1])
    ){
      return m[1]}
  
    // в противном случае нам нужно создать
     // если идентификатор предоставляется вызывающим в опциях, мы используем это
    if(opts.sessionID) return opts.sessionID
    // в противном случае используется 64-битная случайная строка
    return randomString(64)}
    function ownProp(o,p){return Object.prototype.hasOwnProperty.call(o,p)}

    function cleanup(){var id,now,next
      now = +new Date
      next=Infinity
      timeout=null
      for(id in sessions) if(ownProp(sessions,id)){
        if(sessions[id].expiration < now){
          delete sessions[id]}
        else next = next<sessions[id].expiration ? next : sessions[id].expiration}
      if(next<Infinity)
        timeout=setTimeout(cleanup,next - (+new Date) + 1000)}
// randomString возвращает псевдослучайную строку ASCII, которая содержит как минимум указанное количество битов энтропии
// возвращаемое значение представляет собой строку длиной ⌈bit / 6⌉ символов из алфавита base64        
function randomString(bits){var chars,rand,i,ret
  chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  ret=''
  // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
  while(bits > 0){
    rand=Math.floor(Math.random()*0x100000000) // 32-bit integer
    // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
    for(i=26; i>0 && bits>0; i-=6, bits-=6) ret+=chars[0x3F & rand >>> i]}
  return ret}   
  
  function Session(id,opts){
   // console.log('opts',opts);
    this.id=id
    this.data={}
    this.path=opts.path||'/'
    this.domain=opts.domain
// если вызывающая сторона предоставляет явное время жизни, мы используем постоянный файл cookie
     // истекает время жизни клиента и сервера через несколько секунд после последнего использования
     // в противном случае cookie будет существовать в браузере, пока пользователь не закроет окно или вкладку,
     // и на сервере 24 часа после последнего использования
    if(opts.lifetime){
      this.persistent = 'persistent' in opts ? opts.persistent : true
      this.lifetime=opts.lifetime}
    else{
      this.persistent=false
      this.lifetime=86400}}

Session.prototype.getSetCookieHeaderValue=function(){let parts
  parts=['SID='+this.id]
  if(this.path) parts.push('path='+this.path)
  if(this.domain) parts.push('domain='+this.domain)
  if(this.persistent) parts.push('expires='+dateCookieString(this.expiration))
  //console.log('parts',parts,parts.join('; '))
  return parts.join('; ')}

  // от миллисекунд с момента окончания срока действия файла cookie до формата истекающего формата Wdy, DD-Mon-YYYY HH: MM: SS GMT
  function dateCookieString(ms){var d,wdy,mon
    d=new Date(ms)
    wdy=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    mon=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return wdy[d.getUTCDay()]+', '+pad(d.getUTCDate())+'-'+mon[d.getUTCMonth()]+'-'+d.getUTCFullYear()
      +' '+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes())+':'+pad(d.getUTCSeconds())+' GMT'}
  
  function pad(n){return n>9 ? ''+n : '0'+n}

  Session.prototype.destroy=function(){
    console.log('delete sessions')
    delete sessions[this.id]}
  
  Session.prototype.serialize // unimplemented, but would store the session on disk