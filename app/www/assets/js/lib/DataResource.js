"use strict";
define([],function(){
  return function () {
    var that = this;

    that.loaded = ko.observable(false);
    that.response = ko.observable(null);
    that.errors = ko.observable(null);

    that.data_filters = [];
    that.error_filters = [];

    that.update = function(handler){
      that.loaded(false);
      return handler.fail(function(err){
        for(var n in that.error_filters ){
          that.error_filters[n](err);
        }
        that.errors(err);
        that.response(null);
      }).done(function(data){
        for(var n in that.data_filters ){
          that.data_filters[n](data);
        }
        that.errors(null);
        that.response(data);
      }).always(function(){
        that.loaded(true);
      });
    };

  }
});