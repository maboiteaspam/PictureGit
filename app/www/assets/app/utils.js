"use strict";
define([],function(){
  return {
    get_file_name:function(path){
      var k = path.match(/([^/]+)$/i);
      if( k ) k = k[1];
      else k = path;
      return k;
    }
  };
});