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
      AppModel.theme.loaded( false );
      var url = '/assets/themes/'+v+'.bootstrap.min.css';
      ajaxHelper.getCSS(url).always(function(css){
        AppModel.theme.content_prev( AppModel.theme.content() );
        AppModel.theme.content(css);
        AppModel.theme.content_prev("");
        AppModel.theme.loaded( true );
        setTimeout(function(){
          $(".themeSelector ul")
              .scrollTo( $(".themeSelector .active").get(0), 200, {easing:'easeOutExpo'} );
        },450);
      });
      localStorage.setValue("preferred_theme",v);
    });

    AppModel.on("click",".displaySelector ul li", function(){
      var mode = $(this).data("mode");
      AppModel.files.display( mode );
      localStorage.setValue("preferred_display", mode);
      $(".dropdown").removeClass("open");
      return false;
    });
    AppModel.on("click",".sizeSelector ul li", function(ev){
      if( $(this).hasClass("disabled") ){
        ev.preventDefault();
      }else{
        var size = $(this).data("size");
        AppModel.files.size( size );
        localStorage.setValue("preferred_size", size);
        $(".dropdown").removeClass("open");
      }
      return false;
    });
    AppModel.on("click",".btn-new-file", function(ev){
      AppModel.fileDetail.path( AppModel.navigation.location() );
      AppModel.fileDetail.name("");
      AppModel.fileDetail.tab("new-file");
      $(".dropdown").removeClass("open");
      return false;
    });
    AppModel.on("click",".btn-new-directory", function(ev){
      AppModel.fileDetail.path( AppModel.navigation.location() );
      AppModel.fileDetail.name("");
      AppModel.fileDetail.tab("new-directory");
      $(".dropdown").removeClass("open");
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
        if( t ){
          AppModel.pager.current_page(1);
          AppModel.navigation.location(t.path());
        }
      }
      return false;
    });
    AppModel.on("click",".navigation li", function(){
      if( !$(this).hasClass("active") ){
        var i = $(this).index();
        if( i > -1 ){
          var t = AppModel.navigation.breadcrumb()[i];
          if( t ){
            AppModel.pager.current_page(1);
            AppModel.navigation.location(t.path);
          }
        }
      }
      return false;
    });
    AppModel.on("click",".items-pager li", function(){
      if( !$(this).hasClass("disabled")
          && !$(this).hasClass("active") ){
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



    var find_item = function(i){
      if( i > -1 ){
        var t = AppModel.files.items()[i];
        if( t ){
          return t;
        }
      }
      return false;
    };
    var trash_item = function(item){
      AppModel.modal.name(item.name());
      AppModel.modal.type(item.type());
      AppModel.modal.display("trash-"+item.type());
      $(".modal .confirm").one("click",function(){
        AppModel.fileDetail.tab("");
        AppModel.modal.display(false);
        AppModel.modal.name("");
        AppModel.modal.type("");
        var p = null;
        if( item.type() == "file" ){
          p = api.trashFile(item.path());
        }else{
          p = api.trashFolder(item.path());
        }
        p.always(function(){
          AppModel.reload();
          $(".modal form").get(0).reset();
        });
        return false;
      });
    };
    AppModel.on("click",".fileBrowser .btn-logs", function(ev){
      var item;
      if( $(this).parentsUntil(".file").is("tr") ){
        item = find_item($(this).parentsUntil(".file").index());
      }else{
        item = find_item($(this).parentsUntil(".file").parent().index());
      }
      if( item ){
        AppModel.fileDetail.path(item.path());
        AppModel.fileDetail.name(item.name());
        AppModel.fileDetail.tab("logs");
      }
      ev.preventDefault();
      return false;
    });
    AppModel.on("click",".fileBrowser .btn-edit", function(ev){
      var item;
      if( $(this).parentsUntil(".file").is("tr") ){
        item = find_item($(this).parentsUntil(".file").index());
      }else{
        item = find_item($(this).parentsUntil(".file").parent().index());
      }
      if( item ){
        AppModel.fileDetail.path(item.path());
        AppModel.fileDetail.name(item.name());
        AppModel.fileDetail.tab("edit");
      }
      ev.preventDefault();
      return false;
    });
    AppModel.on("click",".fileBrowser .directory .btn-trash", function(ev){
      var item;
      if ($(this).parentsUntil(".directory").is("tr") ){
        item = find_item($(this).parentsUntil(".directory").index());
      }else{
        item = find_item($(this).parentsUntil(".directory").parent().index());
      }
      if( item ){
        trash_item(item);
      }
      ev.preventDefault();
      return false;
    });
    AppModel.on("click",".fileBrowser .file .btn-trash", function(ev){
      var item;
      if( $(this).parentsUntil(".file").is("tr") ){
        item = find_item($(this).parentsUntil(".file").index());
      }else{
        item = find_item($(this).parentsUntil(".file").parent().index());
      }
      if( item ){
        trash_item(item);
      }
      ev.preventDefault();
      return false;
    });
    AppModel.on("click",".fileBrowser .file", function(){
      var item = find_item($(this).index());
      if( item ){
        AppModel.fileDetail.path(item.path());
        AppModel.fileDetail.name(item.name());
        AppModel.fileDetail.tab("zoom");
      }
      return false;
    });
    AppModel.on("click",".fileDetail .btn-edit", function(){
      AppModel.fileDetail.tab("edit");
      return false;
    });
    AppModel.on("click",".fileDetail .btn-logs", function(){
      AppModel.fileDetail.tab("logs");
      return false;
    });
    AppModel.on("click",".fileDetail .btn-zoom", function(){
      AppModel.fileDetail.tab("zoom");
      return false;
    });
    AppModel.on("click",".fileDetail .btn-close", function(){
      AppModel.fileDetail.tab("");
      AppModel.fileDetail.path("");
      AppModel.fileDetail.name("");
      return false;
    });
    AppModel.on("click",".fileDetail .btn-trash", function(){
      trash_item(AppModel.fileDetail);
      return false;
    });
    AppModel.on("submit",".fileDetail .edit form", function(ev){
      ev.preventDefault();
      var form = $('.fileDetail .edit form');
      $('.fileDetail').addClass("loading");
      form.find('input').attr("disabled","disabled");
      form.find('textarea').attr("disabled","disabled");

      var img = form.find('input[type="file"]')[0].files[0];
      var comment = form.find('textarea').val();
      var path = AppModel.fileDetail.path();

      AppModel.loaded(false);
      api.editPicture(path,comment,img)
          .always(function(){
            form.find('input').attr("disabled",null);
            form.find('textarea').attr("disabled",null);

            AppModel.fileDetail.path(path+"?q="+(new Date()));
            AppModel.files.findByPath(path).path(path+"?q="+(new Date()));

            $('.fileDetail').removeClass("loading");
            form.get(0).reset();
          });
      return false;
    });
    AppModel.on("submit",".fileDetail .new-file form", function(ev){
      ev.preventDefault();
      var form = $('.fileDetail .new-file form');
      $('.fileDetail').addClass("loading");
      form.find('input').attr("disabled","disabled");
      form.find('textarea').attr("disabled","disabled");

      var img = form.find('input[type="file"]')[0].files[0];
      var comment = form.find('textarea').val();
      var path = AppModel.fileDetail.path();

      AppModel.loaded(false);
      api.addPicture(path,comment,img)
          .always(function(){
            form.find('input').attr("disabled",null);
            form.find('textarea').attr("disabled",null);
            $('.fileDetail').removeClass("loading");
            AppModel.fileDetail.tab("");
            AppModel.reload();
            form.get(0).reset();
          });
      return false;
    });
    AppModel.on("submit",".fileDetail .new-directory form", function(ev){
      ev.preventDefault();
      var form = $('.fileDetail .new-directory form');
      $('.fileDetail').addClass("loading");
      form.find('input').attr("disabled","disabled");

      var name = form.find('input').val();
      var path = AppModel.navigation.location();

      AppModel.loaded(false);
      api.addDirectory(path,name)
          .always(function(){
            form.find('input').attr("disabled",null);
            $('.fileDetail').removeClass("loading");
            AppModel.fileDetail.tab("");
            AppModel.reload();
            form.get(0).reset();
          });
      return false;
    });

    $(".modal [data-dismiss]").click(function(){
      AppModel.modal.display(false);
    });
    AppModel.modal.display.subscribe(function(value){
      AppModel.files.loaded( !value );
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
    console.log(AppModel)
    api.fetchConfig().always(function(config){
      AppModel.pager.items_by_page(config.display.items_by_page);
      AppModel.user_config.loaded( true );
      AppModel.navigation.location("/");
    });


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
