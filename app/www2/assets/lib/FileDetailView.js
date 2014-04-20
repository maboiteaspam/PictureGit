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

    that.tab = ko.observable("");
    that.path = ko.observable("");
    that.type = ko.observable('file');
    that.name = ko.observable("");
    that.logs = ko.observableArray([]);
    that.preview_url = ko.computed(function(){
      if( that.path().match(/^http/))
        return that.path();
      return "/read_file"+that.path();
    });

    that.item_resource.loaded.subscribe(function(l){
      that.loaded(l);
    })

    that.showTab = function(tab,item){
      if( item ){
        that.path(item.path())
        that.name(item.name())
        that.type(item.type())
      }else if( item === null ){
        that.path("")
        that.name("")
        that.type("")
      }
      if( tab ){
        that.tab(tab)
      }else{
        that.tab("")
      }
    }
  }
});