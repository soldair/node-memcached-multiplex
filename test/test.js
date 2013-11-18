
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

  var server = mc.server();

  server.listen(0,function(){

    var addr = server.address();
    var client = new Memcached(addr.address+':'+addr.port);

    var keys = [['a',1,10],['b',2,10],['c',3,10]];

    var c = keys.length;
    while(keys.length) {
      var s = keys.shift();
      client.set(s[0],s[1],s[2],function(){
        c--;
        if(!c) next();
      })
    }
    
    var multiCalls = []
    var getMulti = client.getMulti;
    client.getMulti = function(keys){
      multiCalls.push(keys);
      getMulti.apply(this,arguments);
    }

    var getters = multi(client);

    function next(){
      var c = 0;
      getters.getMulti(['a','b'],function(err,values){
        console.log('>a,b',values);
        t.equals(values.a,1,'should have 1 for a');
        t.equals(values.b,2,'should have 2 for b');
        ++c;
        if(c === 3) end(); 
      });
      getters.getMulti(['b','c','d'],function(err,values){
        console.log('>b,c,d',values);

        t.equals(values.b,2,'should have 2 for b');
        t.equals(values.c,3,'should have 3 for c');
        t.equals(values.d,undefined,'should have undefined for d');
        ++c;
        if(c === 3) end();
      });
      getters.getMulti(['b'],function(err,values){

        console.log('>b',values);
        t.equals(values.b,2,'should have 2 for b');
        ++c;
        if(c === 3) end();
      });
      
    }

    function end(){
      t.equals(multiCalls.length,2,'should have only made 2 multi calls');
      t.deepEquals(multiCalls[1],['c','d'],'second multi call should not have keys from first multi call');
      t.end();
      server.close();
      client.end();
    }
  });

})


