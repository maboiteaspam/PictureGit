"use strict";
define([],function(){
  return function () {
    var that = this;

    that.loaded = ko.observable(false);
    that.response = ko.observable(null);
    that.errors = ko.observable(null);

    that.update = function(handler){
      that.loaded(false);
      return handler.fail(function(err){
        that.errors(err);
        that.response(null);
      }).done(function(data){
        that.errors(null);
        that.response(data);
      }).always(function(){
        that.loaded(true);
      });
    };

  }
});