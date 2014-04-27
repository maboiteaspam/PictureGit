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

    that.item = {
      path:ko.observable(""),
      position:ko.observable(""),
      position_text:ko.observable(""),
      type:ko.observable(""),
      name:ko.observable(""),
      q:ko.observable(""),
      short_name:ko.observable("")
    };
    that.item.preview_url = ko.computed(function(){
      var r = this.item.path();
      var q = this.item.q();
      if( ! r.match(/^http/) ){
        r = "/read_file"+r;
      }
      if( q ){
        r += "?q="+q;
      }
      return r;
    },that);

    that.item_resource.loaded.subscribe(function(l){
      that.loaded(l);
    });

    that.setItem = function(item){
      if( item ){
        that.item.path(item.path);
        that.item.position(item.position);
        that.item.position_text(item.position_text);
        that.item.type(item.type);
        that.item.name(item.name);
        that.item.short_name(item.short_name);
        that.item_resource.loaded(true);
        return true;
      }else if( item === null ){
        that.item(null);
        that.item.path("");
        that.item.position("");
        that.item.position_text("");
        that.item.type("");
        that.item.name("");
        that.item.short_name("");
        return false;
      }
    };

    that.showTab = function(tab,item){
      that.setItem(item);
      if( tab ){
        that.tab(tab)
      }else{
        that.tab("")
      }
    }
  }
});