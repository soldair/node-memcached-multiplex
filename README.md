
[![Build Status](https://secure.travis-ci.org/soldair/node-memcached-multiplex.png)](http://travis-ci.org/soldair/node-memcached-multiplex)

memcached-multiplex
===================

combine concurrent gets for the same keys into one get/multiget to the server

```js
// first you need memcached. (or something that implements the methods get and getMulti)
var Memcached = require('memcached');
var multi = require('memcache-multiplex');

var getter = multi(new Memcached('127.0.0.1:11211'));

// all of these calls
getter.get('hi',function(err,v){
  console.log('the value of hi',v)
})

getter.get('hi',function(err,v){
  console.log('the value of hi',v)
})

getter.get('hi',function(err,v){
  console.log('the value of hi',v)
})

// make only one call to the memcache server

// get a,b
getter.getMulti(['a','b'],function(){

});

// get c but not b because im alredy fetching b
getter.getMulti(['b','c'],function(){

});

// no call is made im already requesting the keys im searching for.
getter.getMulti(['a','c'],function(){

});

// triggers 2 "getMulti" on the client driver.
// one for keys ['a','b'] and one for just key ['c']

```


multi = require('memcached-multiplex')(new Memcached(hosts));
-------------------------------------------------------------

  - this module exports a function 
  - if you call this function with a memcached client you will get an object with getter methods


.get(key,cb)
-----------

   gets the key

.getMulti([key, key2],cb)
------------------------

  get multiple keys 

.stats
------
  - stats is an object
  - it has stats that help you determine how well you are multiplexing
  - get
    - keys , how many single keys were requested from the memcached server
    - calls, how many keys were requested by calls to the function

  - multi
    - keys, how many keys were requested from the memcached server
    - requested, how many keys were requested by calls to getMulti
    - calls, how many calls to getMulti
    - made, how many calls to get multi resulted in fetching keys from the memcached server

```js
  {
    get:{keys:0,calls:0},
    multi:{keys:0,requested:0,calls:0,made:0}
  }
```





rant! if you use node you should not make multiple concurrent gets for the same external resources. this applies to databases web services whatever.

