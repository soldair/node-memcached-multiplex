
var multi = require('../');

var test = require('tape');

var mc = require('memcache-server-stream');

var Memcached = require('memcached');

test('can nultiplex gets',function(t){
  var server = mc.server()

  server.listen(0,function(){
    var addr = server.address();
    
    var client = new Memcached('127.0.0.1:11212');

    var getters = multi(client);

    getters.get('hi',function(e,v){
      if(!v.hi) v.hi = 0;
      v.hi += 1;
      if(v.hi == 2) end(e,v);
    })
    getters.get('hi',function(e,v){
      if(!v.hi) v.hi = 0;
      v.hi += 1;
      if(v.hi == 2) end(e,v);
    })   

  })

  function end(){
    t.equals(v.hi,2,'should have passed same value back to both gets');
    t.end();
  }

})

test('results are correct with overlapping multigets',function(t){
  t.end();
})


