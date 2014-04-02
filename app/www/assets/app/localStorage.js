"use strict";
define([],function(){

  var storage = {};
  var has_local_storage = function(){
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  };

  if( has_local_storage() ){
    storage = window['localStorage'];
  }

  return function(){
    return {
      getValue:function(k){
        return storage[k];
      },
      setValue:function(k,v){
        return storage[k] = v;
      }
    }
  };

});