"use strict";
(function(){
  require([
    "lib/AppViewModel",
    "lib/AjaxHelper",
    "lib/LocalStorage",
    "lib/PictureGitApi",
    "lib/ThemeView",
    "lib/BrowserView",
    "lib/FileDetailView",
    "lib/ModalView"
  ],function(
      AppViewModel,
      AjaxHelper,
      LocalStorage,
      PictureGitApi,
      ThemeView,
      BrowserView,
      FileDetailView,
      ModalView
      ){

    var ajaxHelper = new AjaxHelper("");
    var localStorage = new LocalStorage();
    var api = new PictureGitApi(ajaxHelper);

    var el = $("body");
    var AppModel = new AppViewModel( el.get(0) );

    var s = AppModel.loaded.subscribe(function(loaded){
      if( loaded )
        AppModel.one("transitionend",".app-loader", function(){
          setTimeout(function(){
            s.dispose();
            AppModel.ready(true);
          },1000);
        });
    });


    var themes = new ThemeView();
    AppModel.init_seq.startup_modules.push(themes);

    AppModel.on("click",".themeSelector ul li", function(){
      var i = $(this).index();
      var t = themes.items()[i];
      if( t ) themes.name(t.name);
      return false;
    });
    themes.url.subscribe(function(url){
      themes.css_resource.update(ajaxHelper.getCSS(url));
    });
    themes.loaded.subscribe(function(loaded){
      if(loaded){
        setTimeout(function(){
          $(".themeSelector ul")
              .scrollTo( $(".themeSelector .active").get(0), 200, {easing:'easeOutExpo'} );
        },450);
        localStorage.setValue("preferred_theme",themes.name());
      }
    });
    var preferred_theme = localStorage.getValue("preferred_theme");
    if( preferred_theme ) themes.name( preferred_theme );
    themes.items.subscribe(function(data){
      var k;
      for( var n in data ){k = data[n];console.log(k)}
      if(!preferred_theme ) themes.name( k.name );
    });
    themes.items_resource.update(api.fetchThemes());

    AppModel.themes = themes;
    AppModel.theme = themes;


    var browser = new BrowserView();
    AppModel.init_seq.startup_modules.push(browser);
    AppModel.browser = browser;
    AppModel.on("click",".displaySelector ul li", function(){
      var mode = $(this).data("mode");
      browser.display_mode( mode );
      localStorage.setValue("preferred_display", mode);
      $(".dropdown").removeClass("open");
      return false;
    });
    AppModel.on("click",".sizeSelector ul li", function(ev){
      if( $(this).hasClass("disabled") ){
        ev.preventDefault();
      }else{
        var size = $(this).data("size");
        browser.display_size( size );
        localStorage.setValue("preferred_size", size);
        $(".dropdown").removeClass("open");
      }
      return false;
    });
    AppModel.on("click",".typeSelector ul li", function(ev){
      if( !$(this).hasClass("disabled") ){
        var type = $(this).data("type");
        browser.display_type( type );
        browser.reload(  );
        localStorage.setValue("preferred_type", type);
        $(".dropdown").removeClass("open");
      }
      return false;
    });
    AppModel.on("click",".btn-new-file", function(ev){
      fileDetail.showTab("new-file",null);
      fileDetail.path( browser.current_url() );
      $(".dropdown").removeClass("open");
      return false;
    });
    AppModel.on("click",".btn-new-directory", function(ev){
      fileDetail.showTab("new-directory",null);
      fileDetail.path( browser.current_url() );
      $(".dropdown").removeClass("open");
      return false;
    });

    AppModel.on("click",".up a", function(){
      browser.browseUp();
      return false;
    });
    AppModel.on("click",".fileBrowser .directory", function(){
      var i = $(this).index();
      if( i > -1 ){
        var item = browser.items()[i];
        if( item ){
          browser.current_page(1);
          browser.current_url(item.path());
        }
      }
      return false;
    });
    AppModel.on("click",".breadcrumb_next .next", function(ev){
      browser.selectBreadcrumbNextAtIndex( $(this).index() );
    });
    AppModel.on("click",".navigation .prev", function(){
      if( !$(this).hasClass("active") ){
        browser.selectBreadcrumbItemAtIndex( $(this).index() );
      }
    });
    AppModel.on("click",".items-pager li", function(){
      if( !$(this).hasClass("disabled")
          && !$(this).hasClass("active") ){
        browser.selectPagerItemAtIndex( $(this).index() );
      }
      return false;
    });
    browser.current_url.subscribe(function(url){
      if( url ){
        var c = parseInt(browser.current_page())-1;
        var i = browser.items_by_page();
        if(browser.display_type() == 'any'){
          browser.items_resource.update(api.fetchDirectoryItems(url,c*i,i));
        }else if(browser.display_type() == 'file'){
          browser.items_resource.update(api.fetchPictures(url,c*i,i));
        }else if(browser.display_type() == 'directory'){
          browser.items_resource.update(api.fetchDirectories(url,c*i,i));
        }
        browser.directories_resource.update(api.fetchDirectories(url));
      }
    });



    var fileDetail = new FileDetailView();
    var modal = new ModalView();
    AppModel.fileDetail = fileDetail;
    AppModel.modal = modal;
    var find_item = function(i){
      if( i > -1 ){
        var t = browser.items()[i];
        if( t ){
          return t;
        }
      }
      return false;
    };
    var trash_item = function(item){
      modal.setItem(item);
      $(".modal .confirm").one("click",function(){
        var p = null;
        if( modal.type() == "file" ){
          p = api.trashFile(item.path());
        }else{
          p = api.trashFolder(item.path());
        }
        modal.item_resource.update(p);
        fileDetail.item_resource.update(p);
        p.always(function(){
          modal.setItem(null);
          fileDetail.showTab(null);
          browser.reload();
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
        fileDetail.showTab("logs",item);
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
        fileDetail.showTab("edit",item);
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
        fileDetail.showTab("zoom",item);
      }
      return false;
    });
    AppModel.on("click",".fileDetail .btn-edit", function(){
      fileDetail.showTab("edit");
      return false;
    });
    AppModel.on("click",".fileDetail .btn-logs", function(){
      fileDetail.showTab("logs");
      return false;
    });
    AppModel.on("click",".fileDetail .btn-zoom", function(){
      fileDetail.showTab("zoom");
      return false;
    });
    AppModel.on("click",".fileDetail .btn-close", function(){
      fileDetail.showTab(null);
      return false;
    });
    AppModel.on("click",".fileDetail .btn-trash", function(){
      trash_item(fileDetail);
      return false;
    });
    AppModel.on("submit",".fileDetail .edit form", function(ev){
      ev.preventDefault();
      var form = $('.fileDetail .edit form');
      disable_form(form);

      var img = form.find('input[type="file"]')[0].files[0];
      var comment = form.find('textarea').val();
      var path = fileDetail.path();

      browser.loaded(false);
      fileDetail.item_resource
          .update(api.editPicture(path,comment,img))
          .done(function(){
            fileDetail.path(path+"?q="+(new Date()));
            browser.findByPath(path).path(path+"?q="+(new Date()));
          })
          .always(function(){
            enable_form(form);
            browser.loaded(true);
          });
      return false;
    });
    AppModel.on("submit",".fileDetail .new-file form", function(ev){
      ev.preventDefault();
      var form = $('.fileDetail .new-file form');
      disable_form(form);

      var img = form.find('input[type="file"]')[0].files[0];
      var comment = form.find('textarea').val();
      var path = fileDetail.path();

      browser.loaded(false);
      fileDetail.item_resource
          .update(api.addPicture(path,comment,img))
          .always(function(){
            fileDetail.showTab(null);
            browser.reload();
            enable_form(form);
          });
      return false;
    });
    AppModel.on("submit",".fileDetail .new-directory form", function(ev){
      ev.preventDefault();
      var form = $('.fileDetail .new-directory form');
      disable_form(form);

      var name = form.find('input').val();
      var path = browser.current_url();

      browser.loaded(false);
      fileDetail.item_resource
          .update(api.addDirectory(path,name))
          .always(function(){
            fileDetail.showTab(null);
            browser.reload();
            enable_form(form);
          });
      return false;
    });

    $(".modal [data-dismiss]").click(function(){
      AppModel.modal.display(false);
    });
    AppModel.modal.display.subscribe(function(value){
      browser.loaded( !value );
    });


    var preferred_display = localStorage.getValue("preferred_display");
    if( preferred_display ) browser.display_mode( preferred_display );

    var preferred_size = localStorage.getValue("preferred_size");
    if( preferred_size ) browser.display_size( preferred_size );

    AppModel.user_config.update(api.fetchConfig());
    AppModel.user_config.response.subscribe(function(data){
      browser.items_by_page(data.display.items_by_page);
      browser.current_url("/");
    });
    AppModel.bind();

    AppModel.on("click",".dropdown", function(){
      if( !$(this).hasClass("disabled")){
        if( !$(this).hasClass("open")) $(".dropdown").removeClass("open");
        $(this).toggleClass("open");
      }
      return false;
    });
    AppModel.on("click",".dropup", function(){
      if( !$(this).hasClass("disabled")){
        if( !$(this).hasClass("open")) $(".dropup").removeClass("open");
        $(this).toggleClass("open");
      }
      return false;
    });
    el.on("click",function(){
      $(".dropdown").removeClass("open");
    });
    function disable_form(form){
      form.find('input').attr("disabled","disabled");
      form.find('textarea').attr("disabled","disabled");
    }
    function enable_form(form,reset){
      form.find('input').attr("disabled",null);
      form.find('textarea').attr("disabled",null);
      if(reset!==false){
        form.get(0).reset();
      }
    }


  });
})();
