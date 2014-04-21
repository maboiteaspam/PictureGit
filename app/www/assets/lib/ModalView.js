"use strict";
define([
  "lib/DataResource"
],function(
    DataResource
    ){
  return function () {
    var that = this;

    that.loaded = ko.observable(false);

    that.item_resource = new DataResource();

    that.display = ko.observable(false);
    that.type = ko.observable("");
    that.name = ko.observable("");
    that.message = ko.observable("");
    that.is_valid = ko.computed(function(){
      return this.display() && this.message()!="";
    },that);

    that.item_resource.loaded.subscribe(function(l){
      that.loaded(l);
    });
    that.setItem = function(item){
      if( item ){
        that.name(item.name());
        that.type(item.type());
        that.display("trash-"+item.type());
      }else if( item === null ){
        that.name("");
        that.type("");
        that.display(false);
      }
    }
  }
});