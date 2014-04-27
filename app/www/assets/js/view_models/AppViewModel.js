"use strict";
define([
  "lib/DataResource"
],function(
    DataResource
    ){
  return function (el) {
    var that = this;
    that.ready = ko.observable(false);

    that.init_seq = {};
    that.init_seq.startup_modules = ko.observableArray([]).extend({ rateLimit: 50 });
    that.loaded = ko.computed(function(){
      var modules = that.init_seq.startup_modules();
      for(var n in modules ){
        if( modules[n].loaded() == false ) return false;
      }
      return modules.length>0;
    }).extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 500 } });

    that.user_config = new DataResource();
    that.init_seq.startup_modules.push(that.user_config);

    that.bind = function(){
      ko.applyBindings(this,el);
    };
    that.unbind = function(){
      ko.cleanNode(el);
    };
    that.off = function(ev,target,fn){
      return $(el).off(ev,target,fn);
    };
    that.on = function(ev,target,fn){
      return $(el).on(ev,target,fn);
    };
    that.one = function(ev,target,fn){
      return $(el).one(ev,target,fn);
    };
  }
});