"use strict";
(function(){
  require([
    "lib/AjaxHelper",
    "lib/LocalStorage",
    "lib/PictureGitApi"
  ],function(
      AjaxHelper,
      LocalStorage,
      PictureGitApi
      ){

    var ajaxHelper = new AjaxHelper("");
    var localStorage = new LocalStorage();
    var api = new PictureGitApi(ajaxHelper);

    function AppViewModel(el) {
      var that = this;
      that.loaded = ko.observable(false);
      that.ready = ko.observable(false);

      that.theme = {};
      that.theme.loaded = ko.observable(false);
      that.theme.name = ko.observable("");
      that.theme.path = ko.observable("");
      that.theme.path_prev = ko.observable("");
      that.theme.content_prev = ko.observable("");
      that.theme.content = ko.observable("");

      that.themes = {};
      that.themes.loaded = ko.observable(false);
      that.themes.items = ko.observableArray([]);
      that.themes.fill = function(items){
        that.themes.items.removeAll();
        for( var n in items ){
          var e = {
            selected:ko.observable(items[n].name==AppModel.theme.name()),
            name:items[n].name,
            path:items[n].path
          };
          AppModel.themes.items.push(e);
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
          e.path = items[n];
          e.type = ko.computed(function(){
            return this.path.match(/\/$/)?'directory':'file';
          },e);
          e.name = ko.computed(function(){
            var r = "";
            if( this.type() == "directory" )
              r = this.path.match(/[/]([^/]+)[/]$/)[1];
            else
              r = this.path.match(/[/]([^/]*)$/)[1];
            if(r.length>15 ) r = r.substr(0,15)+"...";
            return r;
          },e);
          e.preview_url = ko.computed(function(){
            if( this.type() == "file" )
              return "/read_file"+this.path;
          },e);

          that.files.items.push(e);
        }
      };


      that.fileEdit = {};
      that.fileEdit.tab = ko.observable("");
      that.fileEdit.path = ko.observable("");
      that.fileEdit.name = ko.observable("");
      that.fileEdit.logs = ko.observableArray([]);
      that.fileEdit.preview_url = ko.computed(function(){
        return "/read_file"+this.path();
      },that.fileEdit);
      that.fileEdit.edit_url = ko.computed(function(){
        return "/edit_file"+this.path();
      },that.fileEdit);

      that.navigation = {};
      that.navigation.location = ko.observable("");
      that.navigation.breadcrumb = ko.observableArray([]);
      that.navigation.fill = function(path){
        that.navigation.breadcrumb.removeAll();
        var b = path.split("/");

        var item = {
          name:"/",
          path:"/",
          active:ko.observable(false)
        };
        that.navigation.breadcrumb.push(item);

        for( var n in b ){
          if( b[n] != "" ){
            var p = item.path+b[n]+"/";
            var name = b[n];
            if(name.length>15 ) name = name.substr(0,15)+"...";
            item = {
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
      that.theme.loaded.subscribe(function(){
        that.loaded( that.theme.loaded() && that.themes.loaded() && that.files.loaded() );
      });
      that.themes.loaded.subscribe(function(){
        that.loaded( that.theme.loaded() && that.themes.loaded() && that.files.loaded() );
      });
      that.files.loaded.subscribe(function(){
        that.loaded( that.theme.loaded() && that.themes.loaded() && that.files.loaded() );
      });


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


    var AppModel = new AppViewModel( $("body").get(0) );


    AppModel.loaded.subscribe(function(loaded){
      if( loaded )
        AppModel.one("transitionend",".app-loader", function(){
          AppModel.ready(true);
        });
    });

    AppModel.on("click",".themeSelector ul li", function(){
      var i = $(this).index();
      var t = AppModel.themes.items()[i];
      AppModel.theme.name(t.name);
      return false;
    });
    AppModel.theme.name.subscribe(function(v){
      AppModel.theme.path_prev( AppModel.theme.path() );
      AppModel.theme.path('/assets/themes/'+v+'.bootstrap.min.css');
      localStorage.setValue("preferred_theme",v);
      AppModel.one("transitionend",".themeSelector ul", $.debounce( 500, function(){
        $(".themeSelector ul").scrollTo( $(".themeSelector .active").get(0), 200, {easing:'easeOutExpo'} );
      }));
    });
    AppModel.theme.path.subscribe(function(v){
      AppModel.theme.loaded( false );
      setTimeout(function(){
        AppModel.theme.path_prev( "" );
        AppModel.theme.loaded( true );
      },500)
    });

    AppModel.on("click",".displaySelector ul li", function(){
      var mode = $(this).data("mode");
      AppModel.files.display( mode );
      localStorage.setValue("preferred_display", mode);
      return false;
    });
    AppModel.on("click",".sizeSelector ul li", function(){
      var mode = $(this).data("size");
      AppModel.files.size( mode );
      localStorage.setValue("preferred_size", mode);
      return false;
    });



    AppModel.on("click",".up a", function(){
      AppModel.navigation.up();
      return false;
    });
    AppModel.on("click",".fileBrowser .directory", function(){
      var i = $(this).index();
      var t = AppModel.files.items()[i];
      AppModel.navigation.location(t.path);
      return false;
    });
    AppModel.on("click",".navigation li", function(){
      if( !$(this).hasClass("active") ){
        var i = $(this).index();
        var t = AppModel.navigation.breadcrumb()[i];
        AppModel.navigation.location(t.path);
      }
      return false;
    });
    AppModel.navigation.location.subscribe(function(v){
      AppModel.files.loaded( false );
      if( v ){
        api.fetchDirectoryItems(v).always(function(data){
          AppModel.files.fill(data);
          AppModel.navigation.fill(v);
          AppModel.files.loaded( true );
        });
      }
    });



    AppModel.fileEdit.preview_url.subscribe(function(){
      $(".fileEdit .edit form").get(0).reset();
    });
    AppModel.on("click",".fileBrowser .ion-ios7-recording-outline", function(){
      var i = $(this).parentsUntil(".file").parent().index();
      var t = AppModel.files.items()[i];
      AppModel.fileEdit.path(t.path);
      AppModel.fileEdit.name(t.name());
      AppModel.fileEdit.tab("logs");
      return false;
    });
    AppModel.on("click",".fileBrowser .ion-ios7-cloud-upload-outline", function(){
      var i = $(this).parentsUntil(".file").parent().index();
      var t = AppModel.files.items()[i];
      AppModel.fileEdit.path(t.path);
      AppModel.fileEdit.name(t.name());
      AppModel.fileEdit.tab("edit");
      return false;
    });
    AppModel.on("click",".fileBrowser .ion-ios7-trash-outline", function(){
      var i = $(this).parentsUntil(".file").parent().index();
      var t = AppModel.files.items()[i];
      api.trashFile(t.path).always(function(){
        AppModel.navigation.location("");
        AppModel.navigation.location("/");
      });
      return false;
    });
    AppModel.on("click",".fileBrowser .file", function(){
      var i = $(this).index();
      var t = AppModel.files.items()[i];
      AppModel.fileEdit.path(t.path);
      AppModel.fileEdit.name(t.name());
      AppModel.fileEdit.tab("zoom");
      return false;
    });
    AppModel.on("click",".fileEdit .ion-ios7-cloud-upload-outline", function(){
      AppModel.fileEdit.tab("edit");
      return false;
    });
    AppModel.on("click",".fileEdit .ion-ios7-recording-outline", function(){
      AppModel.fileEdit.tab("logs");
      return false;
    });
    AppModel.on("click",".fileEdit .ion-ios7-eye", function(){
      AppModel.fileEdit.tab("zoom");
      return false;
    });
    AppModel.on("click",".fileEdit .ion-ios7-close-outline", function(){
      AppModel.fileEdit.tab("");
      AppModel.fileEdit.path("");
      AppModel.fileEdit.name("");
      return false;
    });
    AppModel.on("click",".fileEdit .ion-ios7-trash-outline", function(){
      AppModel.fileEdit.tab("");
      AppModel.navigation.location("");
      api.trashFile(AppModel.fileEdit.path()).always(function(){
        AppModel.navigation.location("/");
      });
      return false;
    });
    AppModel.on("submit",".fileEdit form", function(ev){
      ev.preventDefault();
      $('.fileEdit form input').attr("disabled","disabled");
      $('.fileEdit form textarea').attr("disabled","disabled");

      var img = $('.fileEdit form input[type="file"]');
      var txt = $('.fileEdit form textarea');
      var data = new FormData();
      data.append(img.attr("name"), img[0].files[0]);
      data.append(txt.attr("name"), txt.val());
      $.ajax({
        'type':'POST',
        'data': data,
        'url': $(this).attr("action"),
        'contentType': false,
        'processData': false
      }).always(function(){
        $('.fileEdit form input').attr("disabled",null);
        $('.fileEdit form textarea').attr("disabled",null);
        var h = $(".fileEdit .preview img").attr("src");
        $(".fileEdit .preview img").attr("src","");
        $(".fileEdit .preview img").attr("src",h+"?q="+(new Date()));
      })
      return false;
    });


    AppModel.on("mouseenter",".fileBrowser .file", function(){
      var i = $(this).index();
      var t = AppModel.files.items()[i];
      /*
       console.log(t)
       */
      return false;
    });



    var preferred_theme = localStorage.getValue("preferred_theme");
    if( preferred_theme ) AppModel.theme.name( preferred_theme );

    var preferred_display = localStorage.getValue("preferred_display");
    if( preferred_display ) AppModel.files.display( preferred_display );

    var preferred_size = localStorage.getValue("preferred_size");
    if( preferred_size ) AppModel.files.size( preferred_size );

    api.fetchThemes().always(function(data){
      var k = [];
      for( var n in data ){
        k.push({
          name:data[n].replace("/assets/themes/","").replace(".bootstrap.min.css",""),
          path:data[n]
        });
      }
      AppModel.themes.fill(k);
      if(!preferred_theme ) AppModel.theme.name( k[0].name );
      AppModel.themes.loaded( true );
    });

    AppModel.navigation.location("/");

    AppModel.bind();



    AppModel.on("click",".dropdown", function(){
      if( !$(this).hasClass("disabled")){
        if( !$(this).hasClass("open")) $(".dropdown").removeClass("open");
        $(this).toggleClass("open");
      }
      return false;
    });
    $("body").on("click",function(){
      $(".dropdown").removeClass("open");
    });


  });
})();
