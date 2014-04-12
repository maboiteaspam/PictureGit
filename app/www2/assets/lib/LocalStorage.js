"use strict";
define([],function(){

  var has_local_storage = false;
  try {
    has_local_storage = ('localStorage' in window && window['localStorage'] !== null);
  } catch (e) {}

  // it is explicitly global because window is global
  var storage = {};

  if( has_local_storage ){
    storage = window['localStorage'];
  }

  return function(){

    var that = this;

    that.getValue = function(k){
      return storage[k];
    };

    that.setValue = function(k,v){
      return storage[k] = v;
    };

  };

});