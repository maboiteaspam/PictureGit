"use strict";
define([],function(){
  return function(base_url){

    var that = this;

    that.getJSON = function(url,data){
      return $.ajax({
        "url":base_url+url,
        "data":data
      });
    };

    that.postJSON = function(url,data){
      return $.ajax({
        'type':'POST',
        "url":base_url+url,
        "data":data
      });
    };

    that.uploadJSON = function(url,data){
      return $.ajax({
        'type':'POST',
        "url":base_url+url,
        'contentType': false,
        'processData': false,
        "data":data
      });
    };

    that.getCSS = function(url,data){
      return $.ajax({
        "url":base_url+url,
        "data":data,
        "dataType":"text"
      });
    };
  }
});