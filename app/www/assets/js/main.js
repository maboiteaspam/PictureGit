"use strict";
(function(){
  require([
    "view_models/AppViewModel",
    "lib/AjaxHelper",
    "lib/LocalStorage",
    "api/PictureGitApi",
    "view_models/ThemeView",
    "view_models/BrowserView",
    "view_models/FileDetailView",
    "view_models/ModalView"
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

    var api_location = window.api_location || "";
    var ajaxHelper = new AjaxHelper(api_location);
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
      for( var n in data ){k = data[n];}
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
        browser.current_page(1);
        browser.reload(  );
        $(".dropdown").removeClass("open");
      }
      return false;
    });
    AppModel.on("click",".btn-new-file", function(ev){
      fileDetail.showTab("new-file",null);
      $(".dropdown").removeClass("open");
      return false;
    });
    AppModel.on("click",".btn-new-directory", function(ev){
      fileDetail.showTab("new-directory",null);
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
          browser.search_text("");
          browser.current_page(1);
          browser.current_url(item.path());
        }
      }
      return false;
    });
    AppModel.on("click",".bread_crumb .prev", function(){
      browser.selectBreadcrumbItemAtIndex( $(this).parent().parent().index() );
    });
    AppModel.on("click",".bread_crumb .next", function(){
      browser.selectBreadcrumbItemAtIndex( $(this).parent().parent().parent().index(), $(this).parent().index() );
    });
    AppModel.on("click",".items-pager li", function(){
      if( !$(this).hasClass("disabled")
          && !$(this).hasClass("active") ){
        browser.selectPagerItemAtIndex( $(this).index() );
      }
      return false;
    });

    ko.computed(function(){
      var url = browser.current_url() || "" ;
      var c = parseInt(browser.current_page())-1;
      var i = browser.items_by_page();
      var search = browser.search_text();
      var type = browser.display_type();
      browser.items_resource.update(api.listItems(url,c*i,i,search,type));
      browser.directories_resource.update((function(){
        var ret = $.Deferred();

        var t = [];
        var k = [];
        var p = url.replace(/(\/\/)/g,"/").split("/");
        p.pop();

        var c_path = "";
        for( var i in p ){
          var part = p[i];
          c_path += part+"/";
          k.push(c_path);
          t.push( api.listItems(c_path,null,null,null,"directory") )
        }

        $.when.apply($,t).done(function(){
          var results = {};
          var t = browser.breadcrumb_items();
          for(var i= 0,e=arguments.length;i<e;i++){
            if(t[i]) t[i].items(arguments[i].items);
          }
          ret.resolve(results)
        });

        return ret;
      })());
    }).extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 250 } });

    AppModel.on("focus",".searchBox input", function(ev){
      $(this).select();
    });
    AppModel.on("click",".searchBox button", function(ev){
      browser.search_text("");
    });
    AppModel.on("keydown","", function(ev){
      if( $(ev.target).not("input").not("textarea").length ){
        $(".searchBox input").val( String.fromCharCode(ev.which) );
        $(".searchBox input").trigger("focus");
      }
    });
    var searchSelectT = null;
    browser.search_text.subscribe(function(){
      clearTimeout(searchSelectT);
      searchSelectT = setTimeout(function(){
        $(".searchBox input").select();
      },1500);
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
      fileDetail.loaded(false);
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
          fileDetail.loaded(true);
          $(".modal form").get(0).reset();
        });
        return false;
      });
      $(".modal .close").one("click",function(){
        browser.loaded(true);
        fileDetail.loaded(true);
        return false;
      });
    };
    AppModel.on("click",".fileBrowser .btn-clear-search", function(ev){
      browser.search_text("");
      return false;
    });
    AppModel.on("click",".fileBrowser .btn-clear-display_type", function(ev){
      browser.display_type("any");
      browser.reload();
      return false;
    });
    AppModel.on("click",".fileBrowser .btn-logs", function(ev){
      var item;
      if( $(this).parentsUntil(".file").is("tr") ){
        item = find_item($(this).parentsUntil(".file").index());
      }else{
        item = find_item($(this).parentsUntil(".file").parent().index());
      }
      if( item ){
        fileDetail.showTab("logs", ko.toJS(item) );
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
        fileDetail.showTab("edit", ko.toJS(item) );
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
        fileDetail.showTab("zoom", ko.toJS(item) );
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
    AppModel.on("click",".fileDetail .btn-next", function(){
      var item = browser.findItemAtPosition( parseInt(fileDetail.item.position())+1 );
      if( item ){
        fileDetail.setItem( ko.toJS(item) );
      }
      return false;
    });
    AppModel.on("click",".fileDetail .btn-prev", function(){
      var item = browser.findItemAtPosition( parseInt(fileDetail.item.position())-1 );
      if( item ){
        fileDetail.setItem( ko.toJS(item) );
      }
      return false;
    });
    AppModel.on("click",".fileDetail .btn-trash", function(){
      trash_item(fileDetail.item);
      return false;
    });
    AppModel.on("submit",".fileDetail .edit form", function(ev){
      ev.preventDefault();
      var form = $('.fileDetail .edit form');
      disable_form(form);

      var img = form.find('input[type="file"]')[0].files[0];
      var comment = form.find('textarea').val();
      var path = fileDetail.item.path();

      browser.loaded(false);
      fileDetail.loaded(false);
      fileDetail.item_resource
          .update(api.editPicture(path,comment,img))
          .done(function(){
            fileDetail.item.q((new Date()));
            browser.findByPath(path).q((new Date()));
          })
          .always(function(){
            enable_form(form);
            browser.loaded(true);
            fileDetail.loaded(true);
          });
      return false;
    });
    AppModel.on("submit",".fileDetail .new-file form", function(ev){
      ev.preventDefault();
      var form = $('.fileDetail .new-file form');
      disable_form(form);

      var img = form.find('input[type="file"]')[0].files[0];
      var comment = form.find('textarea').val();
      var path = browser.current_url();

      browser.loaded(false);
      fileDetail.loaded(false);
      fileDetail.item_resource
          .update(api.addPicture(path,comment,img))
          .always(function(){
            fileDetail.showTab(null);
            browser.reload();
            fileDetail.loaded(true);
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
      fileDetail.loaded(false);
      fileDetail.item_resource
          .update(api.addDirectory(path,name))
          .always(function(){
            fileDetail.showTab(null);
            browser.reload();
            fileDetail.loaded(true);
            enable_form(form);
          });
      return false;
    });

    AppModel.on("click",".fileDetail", function(ev){
      if( $(ev.target).is("div") ){
        fileDetail.showTab(null);
        return false;
      }
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
