"use strict";
define([
  "lib/DataResource"
],function(
    DataResource
    ){
  return function () {
    var that = this;

    that.loaded = ko.observable(false);

    that.name = ko.observable("");
    that.url = ko.observable("");
    that.content_prev = ko.observable("");
    that.content = ko.observable("");

    that.items_resource = new DataResource();
    that.items = ko.computed(function(){
      var items = [];
      var response = that.items_resource.response();
      if( response !== null ){
        var c = that.name();
        for( var n in response ){
          var e = {
            selected:ko.observable(false),
            name:response[n].replace("/assets/themes/","").replace(".bootstrap.min.css",""),
            path:response[n]
          };
          e.selected(e.name==c);
          items.push(e);
        }
      }
      return items;
    }).extend({ rateLimit: 500 });
    that.items_resource.loaded.subscribe(function(v){
      that.loaded(v && that.css_resource.loaded());
    });
    that.css_resource = new DataResource();
    that.css_resource.loaded.subscribe(function(v){
      that.loaded(v && that.items_resource.loaded());
    });
    that.css_resource.response.subscribe(function(css){
      that.content_prev( that.content() );
      that.content(css);
      setTimeout(function(){
        that.content_prev("");
        that.loaded( true );
      },250);
    });

    that.name.subscribe(function(v){
      that.url('/assets/themes/'+v+'.bootstrap.min.css');
    });

    that.name.subscribe(function(v){
      var items = that.items();
      for( var n in items ){
        items[n].selected(items[n].name == v);
      }
    });

  }
});