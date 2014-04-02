"use strict";
(function(){

  require([
    "app/localStorage",
    "app/api",
    "app/directoryBrowser",
    "app/pictureBrowser",
    "app/themeSelector",
    "app/pictureDetails",
    "app/pictureOverlay"
  ],function(
      localStorageFactory,
      ajaxApiFactory,
      directoryBrowserFactory,
      pictureBrowserFactory,
      themeSelectorFactory,
      pictureDetailsFactory,
      pictureOverlayFactory
      ){

    var topFactory = (function(){
      return function(el){
        var model = {
          appTitle: ko.observable(),
          currentPath: ko.observable()
        };
        ko.applyBindings(model, $(el).get(0) );

        return {
          model:model
        };
      }
    })();


    // instance declaration starts here
    var localStorage = localStorageFactory();
    var api = ajaxApiFactory("");
    var topView = topFactory( $(".top") );
    var directoryBrowser = directoryBrowserFactory( $(".directoryBrowser") );
    var pictureBrowser = pictureBrowserFactory( $(".picturesBrowser") );
    var themeSelector = themeSelectorFactory( $(".themeSelector") );
    var pictureDetails = pictureDetailsFactory( $(".pictureDetails") );
    var pictureOverlay = pictureOverlayFactory( $(".pictureOverlay") );

    directoryBrowser.model.browseTo.subscribe(function(newValue) {
      directoryBrowser.el.addClass("loading");
      api.fetchDirectories(newValue)
        .done(function(data){
          directoryBrowser.fillWith(data);
        })
        .fail(function(){
          directoryBrowser.fillEmpty();
        })
        .always(function(){
          directoryBrowser.el.removeClass("loading");
        });
    });

    directoryBrowser.model.browseTo.subscribe(function(newValue) {
      pictureBrowser.el.addClass("loading");
      api.fetchPictures(newValue)
        .done(function(data){
          pictureBrowser.fillWith(data);
        })
        .fail(function(){
          pictureBrowser.fillEmpty();
        })
        .always(function(){
          pictureBrowser.el.removeClass("loading");
        });
    });

    directoryBrowser.model.browseTo.subscribe(function(newValue) {
      topView.model.currentPath(newValue);
    });

    directoryBrowser.onItemClicked(function(item,ev) {

      $(".pictureOverlay").hide().appendTo( "body" );

      var path = "";
      if( item.path === ".." ){
        path = directoryBrowser.model.browseTo();
        path = path.replace("//","/");
        path = path[path.length-1]=="/"?path.substr(0,path.length-1):path;
        path = path.split("/");
        path.shift();
        path.pop();
        path = path.join("/");

        path = path=="/"?"":path;
        path = path==""?"":"/"+path+"/";
      }else{
        path = item.path;
      }
      directoryBrowser.model.browseTo(path);

      ev.preventDefault();
      return false;
    });

    pictureDetails.onCloseClicked(function(){
      pictureDetails.el.hide();
    });

    pictureBrowser.el.on( "click", "div > a ", function(ev) {
      ev.preventDefault();
    });
    pictureBrowser.el.on( "mouseenter", "img", function() {
      var li = $(this).parent().parent();
      var tooltip = li.find(".tooltip");
      var cur_index = li.index();
      var item = pictureBrowser.model.items()[ cur_index ];
      var img = $(this);

      pictureBrowser.el
        .find(".active").removeClass("active");

      img.stop(true,true)
        .transition({ boxShadow: "0 0 2em" })
        .parent().addClass("active");

      tooltip.css("top",0)
        .show()
        .stop(true,true)
        .transition({top:"-"+tooltip.height(), opacity:1});

      pictureOverlay.show( $(this).parent() )
        .width( img.outerWidth() )
        .height( img.outerHeight() )
        .css( "left", (img.parent().width()-img.outerWidth())/2 );

      li.on( "mouseleave", function() {
        tooltip.stop(true,true)
          .transition({opacity:0}).hide();
        img.stop(true,true)
          .transition({ boxShadow: "0 0 0" });
        pictureOverlay.hide();
        $(this).parent().removeClass("active");
      });

      pictureOverlay.onTrash(function(){
        api.trashFile(item.path).done(function(){
          $(".pictureOverlay").trigger("mouseleave");
          pictureBrowser.model.items.remove(item);
          pictureBrowser.el
            .find("img:eq("+cur_index+")").trigger("mouseenter");
        });
        return false;
      });
      pictureOverlay.onLogs(function(){
        $(".pictureOverlay").trigger("mouseleave");
        pictureDetails.model.path(item.path);
        pictureDetails.showTab("logs");
        return false;
      });
      pictureOverlay.onEdit(function(){
        $(".pictureOverlay").trigger("mouseleave");
        pictureDetails.model.path(item.path);
        pictureDetails.show();
        pictureDetails.showTab("edit");
        return false;
      });
      pictureOverlay.onZoom(function(){
        $(".pictureOverlay").trigger("mouseleave");
        pictureDetails.model.path(item.path);
        pictureDetails.show();
        pictureDetails.showTab("zoom");
        return false;
      });

      pictureDetails.onNext(function(){
        var l = pictureBrowser.model.items().length;
        if( cur_index+1 < l){
          cur_index++;
        }else if( l > 0 ){
          cur_index = 0;
        }
        if( cur_index < l ){
          item = pictureBrowser.model.items()[ cur_index ];
        }
        pictureDetails.el.find(".tab-pane").transition({opacity:0,complete:function(){
          pictureDetails.model.path(item.path);
          pictureDetails.el.find(".tab-pane").transition({opacity:1},150);
        }},100);
        return false;
      });
      pictureDetails.onPrev(function(){
        var l = pictureBrowser.model.items().length;
        if( cur_index-1 > 0){
          cur_index--;
        }else if( l > 0 ){
          cur_index = l-1;
        }
        if( cur_index < l ){
          item = pictureBrowser.model.items()[ cur_index ];
        }
        pictureDetails.el.find(".tab-pane").transition({opacity:0,complete:function(){
          pictureDetails.model.path(item.path);
          pictureDetails.el.find(".tab-pane").transition({opacity:1},150);
        }},100);
        return false;
      });
    });





    // app starts here

    var css_el = $("#bootstrap");
    themeSelector.el.addClass("loading");
    themeSelector.onItemClicked(function(item){
      themeSelector.model.current( item.path );
      css_el.attr("href", item.path );
      localStorage.setValue("preferred_theme", item.path );
    });
    var preferred = localStorage.getValue("preferred_theme");
    if( preferred ) {
      css_el.attr("href", preferred );
    }
    themeSelector.model.current( css_el.attr("href") );
    api.fetchThemes()
      .done(function(data){
        themeSelector.fillWith(data);
      })
      .fail(function(){
        themeSelector.fillEmpty();
        themeSelector.el.hide();
      })
      .always(function(){
          var app_loader = $(".app-loader");
          setTimeout(function(){
            directoryBrowser.model.browseTo("/");
            setTimeout(function(){
              themeSelector.el.removeClass("loading");
              app_loader.transition({left:"-100%", duration:1500, easing: 'easeOutExpo'},function(){
                app_loader
                    .remove()
                ;
              });
              app_loader.find(".loading").transition({opacity:"0", duration:1000});
            },2000);
          },1000);
          setTimeout(function(){
            app_loader.find(".loading .status").text("still loading...");
          },950);
          setTimeout(function(){
            app_loader.find(".loading .status").text("almost there...");
          },2000);
      });

    api.fetchConfig()
      .done(function(data){
        topView.model.appTitle(data.app_title)
      });


  });
})();
