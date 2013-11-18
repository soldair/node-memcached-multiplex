


module.exports = function(server){

  var o = {};
  o.stats = {
    get:{keys:0,calls:0},
    multi:{keys:0,requested:0,calls:0,made:0}
  }
  // multiplex the cache get.
  o._getq = {};
  o.get = function(key,cb){

    o.stats.get.calls++;

    if(o._getq[key]) return o._getq[key].push(cb);
    o._getq[key] = [cb];

    o.stats.get.keys++;

    server.get(key,function(err,data){
      var q = o._getq[key];
      delete o._getq[key];
      while(q.length) q.shift()(err,data);
    }); 
  }


  // so i want to getMulti but i may be getting multi some of the keys in my list already
  // handle
  o._multiplexq = {}; 
  o._multicalls = {}; 
  o._multires = {}; 
  o._multiid = 0;

  o.getMulti = function(keys,cb){
    var tofetch = []; 
    var id = ++o._multiid;

    o.stats.multi.calls++;
    o.stats.multi.requested += keys.length;

    o._multires[id] = {cb:cb,res:{},c:0};// how many more keys im waiting for and my result
    o._multicalls[id] = [];// the keys other people are waiting for.

    for(var i=0;i<keys.length;++i) {
      if(o._multiplexq[keys[i]]) {
        var mid = o._multiplexq[keys[i]];
        // i need this key from this getMulti call.
        o._multicalls[mid].push([keys[i],id]);
      } else {
        // im going to get this key.
        o._multiplexq[keys[i]] = id; 
        tofetch.push(keys[i]);
        o._multicalls[id].push([keys[i],id]);
      }
 
      o._multires[id].c++;
    }   

    if(!tofetch.length) return;

    o.stats.multi.keys += keys.length;
    o.stats.made++;

    server.getMulti(tofetch,function(err,data){
      // unroll the keys people are waiting for.
      var q = o._multicalls[id];
      delete o._multicalls[id];

      // i am done fetching. cleanup flags set that defined this id as fetching tofetch keys
      for(var i=0;i<tofetch.length;++i) {
        delete o._multiplexq[tofetch[i]]; 
      }

      // send all callbacks.
      while(q.length){
        var waiting = q.shift();
        var state = o._multires[waiting[1]];
        if(err) state.err = err;
        else state.res[waiting[0]] = data[waiting[0]];
        state.c--;
        if(!state.c) state.cb(state.err,state.res); 
      }
    })  

  }

  return o;
}
