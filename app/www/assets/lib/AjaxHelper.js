"use strict";
define([],function(){
  return function(base_url){

    var that = this;

    var defer = function(ajax,time_before,time_after){
      time_before = time_before || 0;
      time_after = time_after || 0;
      var d = $.Deferred();
      setTimeout(function(){
        ajax.done(function(e){
          setTimeout(function(){d.resolve(e);},time_after);
        }).fail(function(e){
          setTimeout(function(){d.reject(e);},time_after);
        });
      },time_before)
      return d;
    };

    that.getJSON = function(url,data,time_before,time_after){
      return defer($.ajax({
        "url":base_url+url,
        "data":data
      }),time_before,time_after);
    };

    that.postJSON = function(url,data,time_before,time_after){
      return defer($.ajax({
        'type':'POST',
        "url":base_url+url,
        "data":data
      }),time_before,time_after);
    };

    that.uploadJSON = function(url,data,time_before,time_after){
      return defer($.ajax({
        'type':'POST',
        "url":base_url+url,
        'contentType': false,
        'processData': false,
        "data":data
      }),time_before,time_after);
    };

    that.getCSS = function(url,data,time_before,time_after){
      return defer($.ajax({
        "url":base_url+url,
        "data":data,
        "dataType":"text"
      }),time_before,time_after);
    };
  }
});