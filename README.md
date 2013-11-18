
[![Build Status](https://secure.travis-ci.org/soldair/node-memcached-multiplex.png)](http://travis-ci.org/soldair/node-memcached-multiplex)

memcached-multiplex
===================

combine concurrent gets for the same keys into one get/multiget to the server



```js
var Memcached = require('memcached');l
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


rant! if you use node you should not make multiple concurrent gets for the same external resources. this applies to databases web services whatever.

