/**
 *
 * MOVED TO: https://github.com/iFind/html5MultidimensionalStorage
 *
 * This methods extends the default HTML5 Storage object and add support
 * to set and get multidimensional data
 *
 * @example Storage.setObj('users.albums.sexPistols',"blah");
 * @example Storage.setObj('users.albums.sexPistols',{ sid : "My Way", nancy : "Bitch" });
 * @example Storage.setObj('users.albums.sexPistols.sid',"Other songs");
 *
 * @example Storage.getObj('users');
 * @example Storage.getObj('users.albums');
 * @example Storage.getObj('users.albums.sexPistols');
 * @example Storage.getObj('users.albums.sexPistols.sid');
 * @example Storage.getObj('users.albums.sexPistols.nancy');
 *
 * This is just a prototype and is not recommended to use at production apps
 * USE AT YOUR OWN RISK
 *
 * @author Klederson Bueno <klederson@klederson.com>
 * @author Gabor Zsoter <helo@zsitro.com>
 */
//Add Storage support for objects
Storage.prototype.__walker = function(path,o) {
  //Validate if path is an object otherwise returns false
  if(typeof path !== "object")
    return false;

  if(path.length === 0){
    return o;
  }

  for(var i in path){
    var prop = path[i];
    //Check if path step exists
    if(o.hasOwnProperty(prop)){
      var val = o[prop];
      if(typeof val == 'object'){
        path.splice(0,1);
        return this.__walker(path,val);
      } else {
        return val;
      }
    }
  }
};

Storage.prototype.setObj = function(key, value) {

  var path = key.split('.');

  //First level is always the localStorage key pair item
  var _key = path[0];
  var os = this.getItem(_key) ? JSON.parse(this.getItem(_key)) : null; //general storage key pair element
  path.splice(0,1);

  if(os === null) {
    os = {};
    this.setItem(_key,JSON.stringify(os));
  }

  var innerWalker = function(path,o) {

    //Validate if path is an object otherwise returns false
    if(typeof path !== "object")
      return false;

    if(path.length == 1) {
      o[path[0]] = value;
      return o;
    }

    var val = null;

    for(var i in path){
      var prop = path[i];
      //Check if path step exists
      if(o.hasOwnProperty(prop)) {
        val = o[prop];
        if(typeof val == 'object'){
          path.splice(0,1);
          return innerWalker(path,val);
        }
      } else {
        //create depth
        o[prop] = {};
        val = o[prop];
        path.splice(0,1);
        return innerWalker(path,val);
      }
    }
  };

  innerWalker(path,os);

  this.setItem(_key,JSON.stringify(os));
};

Storage.prototype.getObj = function(key) {
  key = key.split('.');

  //First level is always the localStorage key pair item
  var _key = key[0];
  var o = this.getItem(_key) ? JSON.parse(this.getItem(_key)) : null;

  if(o === null)
    return false;

  key.splice(0,1);

  return this.__walker(key,o);
};
