"use strict";
define([],function(){
  return function (el) {
    var that = this;
    that.loaded = ko.observable(false);
    that.ready = ko.observable(false);

    that.user_config = {};
    that.user_config.loaded = ko.observable(false);

    that.modal = {};
    that.modal.display = ko.observable(false);
    that.modal.type = ko.observable("");
    that.modal.name = ko.observable("");
    that.modal.message = ko.observable("");
    that.modal.is_valid = ko.computed(function(){
      return this.display() && this.message()!="";
    },that.modal);

    that.theme = {};
    that.theme.loaded = ko.observable(false);
    that.theme.name = ko.observable("");
    that.theme.content_prev = ko.observable("");
    that.theme.content = ko.observable("");

    that.themes = {};
    that.themes.loaded = ko.observable(false);
    that.themes.items = ko.observableArray([]);
    that.themes.fill = function(items){
      that.themes.items.removeAll();
      for( var n in items ){
        var e = {
          selected:ko.observable(items[n].name==that.theme.name()),
          name:items[n].name,
          path:items[n].path
        };
        that.themes.items.push(e);
      }
    };

    that.pager = {};
    that.pager.total_count = ko.observable(0);
    that.pager.items_by_page = ko.observable(30);
    that.pager.current_page = ko.observable(1);
    that.pager.page_count = ko.computed(function(){
      return Math.ceil(this.total_count()/this.items_by_page()) || 0;
    },that.pager);
    that.pager.display = ko.computed(function(){
      return this.page_count() > 0;
    },that.pager);
    that.pager.items = ko.observableArray([]);
    that.pager.fill = function(info){
      that.pager.total_count(info.total_count);
      that.pager.items_by_page(info.items_by_page);
      var p = that.pager.page_count();
      that.pager.items.removeAll();
      if( p > 1 ){
        that.pager.items.push({
          name:"<",
          enabled:1!=that.pager.current_page(),
          selected:false
        });
        for( var i=1;i<=p;i++){
          var e = {};
          e.name = ""+i;
          e.selected = i==that.pager.current_page();
          e.enabled = true;
          that.pager.items.push(e);
        }
        that.pager.items.push({
          name:">",
          enabled:p!=that.pager.current_page(),
          selected:false
        });
      }
    };

    that.files = {};
    that.files.display = ko.observable("table");
    that.files.size = ko.observable("size-1");
    that.files.loaded = ko.observable(false);
    that.files.items = ko.observableArray([]);
    that.files.fill = function(items){
      that.files.items.removeAll();
      for( var n in items ){
        var e = {};
        e.path = ko.observable(items[n]);
        e.type = ko.computed(function(){
          return this.path().match(/\/$/)?'directory':'file';
        },e);
        e.name = ko.computed(function(){
          var r = "";
          if( this.type() == "directory" )
            r = this.path().match(/[/]([^/]+)[/]$/)[1];
          else
            r = this.path().match(/[/]([^/]*)$/)[1];
          return r;
        },e);
        e.short_name = ko.computed(function(){
          var r = this.name();
          if(r.length>15 ) r = r.substr(0,15)+"...";
          return r;
        },e);
        e.preview_url = ko.computed(function(){
          if( this.path().match(/^http/))
            return this.path();
            return "/read_file"+this.path();
        },e);

        that.files.items.push(e);
      }
    };
    that.files.findByPath = function(p){
      var items = that.files.items();
      for( var n in items ){
        var e = items[n];
        if( e.path() == p ){
          return e;
        }
      }
    };


    that.fileDetail = {};
    that.fileDetail.tab = ko.observable("");
    that.fileDetail.path = ko.observable("");
    that.fileDetail.type = ko.observable('file');
    that.fileDetail.name = ko.observable("");
    that.fileDetail.logs = ko.observableArray([]);
    that.fileDetail.preview_url = ko.computed(function(){
      if( this.path().match(/^http/))
        return this.path();
      return "/read_file"+this.path();
    },that.fileDetail);

    that.navigation = {};
    that.navigation.location = ko.observable("");
    that.navigation.breadcrumb = ko.observableArray([]);
    that.navigation.fill = function(path){
      that.navigation.breadcrumb.removeAll();
      var b = path.split("/");

      var item = {
        name:"/",
        short_name:"/",
        path:"/",
        active:ko.observable(false)
      };
      that.navigation.breadcrumb.push(item);

      for( var n in b ){
        if( b[n] != "" ){
          var p = item.path+b[n]+"/";
          var name = b[n];
          var short_name = name;
          if(short_name.length>15 ) short_name = short_name.substr(0,15)+"...";
          item = {
            short_name:short_name,
            name:name,
            path:p,
            active:ko.observable(false)
          };
          that.navigation.breadcrumb.push(item);
        }
      }
      item.active(true);
    };
    that.navigation.up = function(){
      var l = that.navigation.location().split("/").slice(0,-2).join("/")+"/";
      that.navigation.location(l);
    };

    that.theme.name.subscribe(function(v){
      var items = that.themes.items();
      for( var n in items ){
        items[n].selected(items[n].name == v);
      }
    });
    that.theme.loaded.subscribe(function(v){
      that.loaded( v && that.themes.loaded() && that.files.loaded() && that.user_config.loaded() );
    });
    that.themes.loaded.subscribe(function(v){
      that.loaded( v && that.theme.loaded() && that.files.loaded() && that.user_config.loaded() );
    });
    that.files.loaded.subscribe(function(v){
      that.loaded( v && that.theme.loaded() && that.themes.loaded() && that.user_config.loaded() );
    });
    that.user_config.loaded.subscribe(function(v){
      that.loaded( v && that.theme.loaded() && that.themes.loaded() && that.files.loaded() );
    });

    that.reload = function(){
      var l = that.navigation.location();
      that.navigation.location("");
      that.navigation.location(l);
    };
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