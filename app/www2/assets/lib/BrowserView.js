"use strict";
define([
  "lib/DataResource"
],function(
    DataResource
    ){
  return function () {
    var that = this;

    that.loaded = ko.observable(false).extend({ rateLimit: 0 });

    that.current_url = ko.observable(null);
    that.display_type = ko.observable("any");
    that.display_mode = ko.observable("table");
    that.display_size = ko.observable("size-1");
    that.filter = ko.observable("view");
    that.search_text = ko.observable("");
    that.delayed_search_text = ko.computed(that.search_text)
        .extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 200 } });

    that.items_resource = new DataResource();
    that.directories_resource = new DataResource();

    that.total_count = ko.computed(function(){
      var count = 0;
      var response = that.items_resource.response();
      if( response !== null ){
        count = response.total_count;
      }
      return count;
    });
    that.items_by_page = ko.observable(0);
    that.items_resource.response.subscribe(function(response){
      if( response !== null ){
        that.items_by_page(response.items_by_page);
      }
    })
    that.current_page = ko.observable(1);
    that.limit_start = ko.computed(function(){
      var c_page = that.current_page()-1;
      c_page = c_page<0?0:c_page;
      return Math.ceil(that.items_by_page()*c_page)+1;
    });
    that.limit_end = ko.computed(function(){
      var limit_end = that.limit_start()+that.items_by_page();
      limit_end = limit_end>that.total_count()?that.total_count():limit_end;
      return limit_end;
    });
    that.page_count = ko.computed(function(){
      return Math.ceil(that.total_count()/that.items_by_page()) || 0;
    });

    that.items_resource.loaded.subscribe(function(l){
      that.loaded(l && that.directories_resource.loaded());
    })
    that.directories_resource.loaded.subscribe(function(l){
      that.loaded(l && that.items_resource.loaded());
    });
    that.delayed_search_text.subscribe(function(){
      that.reload();
    });


    that.pager_items = ko.computed(function(){
      var items = [];
      var p = that.page_count();
      if( p > 1 ){
        items.push({
          name:"<",
          enabled:1!=that.current_page(),
          selected:false,
          type:"prev"
        });
        for( var i=1;i<=p;i++){
          var e = {};
          e.name = ""+i;
          e.selected = i==that.current_page();
          e.enabled = true;
          e.type = "index";
          items.push(e);
        }
        items.push({
          name:">",
          enabled:p!=that.current_page(),
          selected:false,
          type:"next"
        });
      }
      return items;
    }).extend({ rateLimit: 0 });

    that.breadcrumb_items = ko.computed(function(){
      var items = [];
      var c = that.current_url();
      if( c ){
        var b = c.split("/");
        var item = {
          name:"/",
          short_name:"/",
          path:"/",
          active:ko.observable(false)
        };
        items.push(item);
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
            items.push(item);
          }
        }
        item.active(true);
      }
      return items;
    }).extend({ rateLimit: 0 });

    that.items = ko.computed(function(){
      var items = [];
      var response = that.items_resource.response();
      if( response !== null ){
        for( var n in response.items ){
          var e = {};
          e.path = ko.observable(response.items[n]);
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
          items.push(e);
        }
      }
      return items;
    }).extend({ rateLimit: 0 });

    that.breadcrumb_next = ko.computed(function(){
      var retour = [];
      var response = that.directories_resource.response();
      if( response ){
        var items = response.items;
        for(var n in items ){
          var e = {};
          e.path = ko.observable(response.items[n]);
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
          retour.push(e);
        }
      }
      return retour;
    }).extend({ rateLimit: 0 });

    that.findByPath = function(p){
      var items = that.items();
      for( var n in items ){
        var e = items[n];
        if( e.path() == p ){
          return e;
        }
      }
    };
    that.browseUp = function(){
      var c = that.current_url();
      if( c ){
        var l = that.current_url().split("/").slice(0,-2).join("/")+"/";
        that.current_page(1);
        that.current_url(l);
      }
    };
    that.browsePrevPage = function(){
      var c = that.current_page();
      c = parseInt(c)
      if( c > 0 ) that.current_page(c-1);
    };
    that.browseNextPage = function(){
      var c = that.current_page();
      c = parseInt(c)
      if( c < that.pager_items().length ) that.current_page(c+1);
    };
    that.selectBreadcrumbNextAtIndex = function(i){
      if( i > -1 ){
        var breadcrumb_item = that.breadcrumb_next()[i];
        if( breadcrumb_item ){
          var url = that.current_url();
          that.current_page(1);
          that.current_url(url+""+breadcrumb_item.name()+"/");
        }
      }
    };
    that.selectBreadcrumbItemAtIndex = function(i){
      if( i > -1 ){
        var breadcrumb_item = that.breadcrumb_items()[i];
        if( breadcrumb_item ){
          that.current_page(1);
          that.current_url(breadcrumb_item.path);
        }
      }
    };
    that.selectPagerItemAtIndex = function(i){
      if( i > -1 ){
        var pager = that.pager_items()[i];
        if( pager ){
          if( pager.type == "prev" ){
            that.browsePrevPage();
          }else if( pager.type == "next" ){
            that.browseNextPage();
          }else{
            that.current_page(pager.name);
          }
          that.reload();
        }
      }
    };
    that.reload = function(){
      var l = that.current_url();
      that.current_url("");
      that.current_url(l);
    };

  }
});