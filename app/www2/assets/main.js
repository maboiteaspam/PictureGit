"use strict";
(function(){
  require([
    "lib/AppViewModel",
    "lib/AjaxHelper",
    "lib/LocalStorage",
    "lib/PictureGitApi"
  ],function(
      AppViewModel,
      AjaxHelper,
      LocalStorage,
      PictureGitApi
      ){

    var ajaxHelper = new AjaxHelper("");
    var localStorage = new LocalStorage();
    var api = new PictureGitApi(ajaxHelper);

    var AppModel = new AppViewModel( $("body").get(0) );


    var s = AppModel.loaded.subscribe(function(loaded){
      if( loaded )
        AppModel.one("transitionend",".app-loader", function(){
          setTimeout(function(){
            s.dispose();
            AppModel.ready(true);
          },1000);
        });
    });

    AppModel.on("click",".themeSelector ul li", function(){
      var i = $(this).index();
      var t = AppModel.themes.items()[i];
      if( t ) AppModel.theme.name(t.name);
      return false;
    });
    AppModel.theme.name.subscribe(function(v){
      AppModel.theme.path('/assets/themes/'+v+'.bootstrap.min.css');
      localStorage.setValue("preferred_theme",v);
      AppModel.one("transitionend",".themeSelector ul", $.debounce( 200, function(){
        $(".themeSelector ul").scrollTo( $(".themeSelector .active").get(0), 200, {easing:'easeOutExpo'} );
      }));
    });
    AppModel.theme.path.subscribe(function(){
      AppModel.theme.loaded( false );
      setTimeout(function(){
        AppModel.theme.loaded( true );
      },1000);
    });

    AppModel.on("click",".displaySelector ul li", function(){
      var mode = $(this).data("mode");
      AppModel.files.display( mode );
      localStorage.setValue("preferred_display", mode);
      return false;
    });
    AppModel.on("click",".sizeSelector ul li", function(){
      var size = $(this).data("size");
      AppModel.files.size( size );
      localStorage.setValue("preferred_size", size);
      return false;
    });



    AppModel.on("click",".up a", function(){
      AppModel.navigation.up();
      return false;
    });
    AppModel.on("click",".fileBrowser .directory", function(){
      var i = $(this).index();
      if( i > -1 ){
        var t = AppModel.files.items()[i];
        if( t ) AppModel.navigation.location(t.path);
      }
      return false;
    });
    AppModel.on("click",".navigation li", function(){
      if( !$(this).hasClass("active") ){
        var i = $(this).index();
        if( i > -1 ){
          var t = AppModel.navigation.breadcrumb()[i];
          if( t ) AppModel.navigation.location(t.path);
        }
      }
      return false;
    });
    AppModel.on("click",".items-pager li", function(){
      if( !$(this).hasClass("disabled") ){
        var i = $(this).index();
        if( i > -1 ){
          var t = AppModel.pager.items()[i];
          if( i == 0 ){
            var c = AppModel.pager.current_page();
            c = parseInt(c)
            if( c > 0 ) AppModel.pager.current_page(c-1);
          }else if( i == AppModel.pager.items().length-1 ){
            var c = AppModel.pager.current_page();
            c = parseInt(c)
            if( c < AppModel.pager.items().length ) AppModel.pager.current_page(c+1);
          }else{
            AppModel.pager.current_page(t.name);
          }
          AppModel.reload();
        }
      }
      return false;
    });
    AppModel.navigation.location.subscribe(function(v){
      AppModel.files.loaded( false );
      if( v ){
        var c = parseInt(AppModel.pager.current_page())-1;
        var i = AppModel.pager.items_by_page();
        api.fetchDirectoryItems(v,c*i,i).always(function(data){
          if( data.items.length==0 && data.total_count >0 ){
            c--;
            api.fetchDirectoryItems(v,c*i,i).always(function(data){
              AppModel.files.fill(data.items);
              AppModel.navigation.fill(v);
              AppModel.pager.fill(data);
              AppModel.files.loaded( true );
            });
          }else{
            AppModel.files.fill(data.items);
            AppModel.navigation.fill(v);
            AppModel.pager.fill(data);
            setTimeout(function(){
              AppModel.files.loaded( true );
            },500)
          }
        });
      }
    });



    AppModel.fileEdit.preview_url.subscribe(function(){
      $(".fileEdit .edit form").get(0).reset();
    });
    var find_item = function(i){
      if( i > -1 ){
        var t = AppModel.files.items()[i];
        if( t ){
          return t;
        }
      }
      return false;
    };
    AppModel.on("click",".fileBrowser .ion-ios7-recording-outline", function(){
      var item = find_item($(this).parentsUntil(".file").parent().index());
      if( item ){
        AppModel.fileEdit.path(item.path);
        AppModel.fileEdit.name(item.name());
        AppModel.fileEdit.tab("logs");
      }
      return false;
    });
    AppModel.on("click",".fileBrowser .ion-ios7-cloud-upload-outline", function(){
      var item = find_item($(this).parentsUntil(".file").parent().index());
      if( item ){
        AppModel.fileEdit.path(item.path);
        AppModel.fileEdit.name(item.name());
        AppModel.fileEdit.tab("edit");
      }
      return false;
    });
    AppModel.on("click",".fileBrowser .ion-ios7-trash-outline", function(){
      var item = find_item($(this).parentsUntil(".file").parent().index());
      if( item ){
        AppModel.loaded(false);
        api.trashFile(item.path).always(function(){
          AppModel.reload();
        });
      }
      return false;
    });
    AppModel.on("click",".fileBrowser .file", function(){
      var item = find_item($(this).index());
      if( item ){
        AppModel.fileEdit.path(item.path);
        AppModel.fileEdit.name(item.name());
        AppModel.fileEdit.tab("zoom");
      }
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
      AppModel.loaded(false);
      api.trashFile(AppModel.fileEdit.path()).always(function(){
        AppModel.reload();
      });
      return false;
    });
    AppModel.on("submit",".fileEdit form", function(ev){
      ev.preventDefault();
      $('.fileEdit').addClass("loading");
      $('.fileEdit form input').attr("disabled","disabled");
      $('.fileEdit form textarea').attr("disabled","disabled");

      var img = $('.fileEdit form input[type="file"]');
      var txt = $('.fileEdit form textarea');
      var data = new FormData();
      data.append(img.attr("name"), img[0].files[0]);
      data.append(txt.attr("name"), txt.val());

      AppModel.loaded(false);
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
        $('.fileEdit').removeClass("loading");
        $(".fileEdit .edit form").get(0).reset();
        AppModel.reload();
      })
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
