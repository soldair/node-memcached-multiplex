
var multi = require('../');
var test = require('tape');
var Memcached = require('memcached');
var mc = require('memcache-server-stream');


test('can multiplex gets',function(t){


  var server = mc.server();

  server.listen(0,function(){

    var addr = server.address();
    var client = new Memcached(addr.address+':'+addr.port);

    // monkeypatch get to count calls.
    var get = client.get;
    var getCount = 0;
    client.get = function(){
      getCount++;
      get.apply(this,arguments);
    }

    var getters = multi(client);

    var calls = 0;

    client.set('hi',1,10,function(){

      getters.get('hi',function(e,v){
        calls++;
        t.equals(v,1,'get of hi should be 1'); 
        if(calls == 2) end();
      })

      getters.get('hi',function(e,v){
        calls++;
        t.equals(v,1,'get of hi should be 1');
        if(calls == 2) end();
      })   
    });

    function end(){
      t.equals(getCount,1,'should have hit the memcache server once');
      t.end();
      server.close();
      client.end();

    }
  });


})

test('results are correct with overlapping multigets',function(t){
  t.end();
})


