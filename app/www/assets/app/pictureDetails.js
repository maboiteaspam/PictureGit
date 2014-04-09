"use strict";
define(["app/utils"],function(utils){

  return function(el){

    var onCloseClicked = function(){};
    var onNextClicked = function(){};
    var onPrevClicked = function(){};

    var model = {
      path:ko.observable(""),
      srcPath:ko.observable(""),
      editPath:ko.observable(""),
      fileName:ko.observable(""),
      onClose:function(){
        if( onCloseClicked ) onCloseClicked();
        return false;
      },
      onNext:function(){
        if( onNextClicked ) onNextClicked();
        return false;
      },
      onPrev:function(){
        if( onPrevClicked ) onPrevClicked();
        return false;
      }
    };

    model.path.subscribe(function(newValue){
      newValue = newValue || "";
      newValue = newValue.replace("//","/");
      newValue = newValue.substr(0,1)=="/"?newValue.substr(1):newValue;
      model.editPath( "/edit_file/"+newValue );
      model.srcPath( "/read_file/"+newValue );
      model.fileName( utils.get_file_name(newValue) );
    });
    ko.applyBindings(model, $(el).get(0) );

    var resizeHandle;

    var resizePicture = function(){
      var pictureSelector = el.find(".body .zoom");
      var bodySelector = el.find(".body");

      pictureSelector
          .css("width","auto")
          .css("height","auto");

      var bh = bodySelector.height();
      var bw = bodySelector.width();
      var ih = pictureSelector.height();
      var iw = pictureSelector.width();

      var rh = bh/ih;
      var rw = bw/iw;

      var r = rh;
      if( rw < rh ) r = rw;

      pictureSelector.width(iw*r);
      pictureSelector.height(ih*r);
      pictureSelector
          .css( "margin-top", (bh-(ih*r)) /2 )
    };

    var hide = function(){
      el.hide();
      disableZoomTab();
      $("body").off("click");
    };

    var show = function(){
      el.show();
      $("body").off("click").on("click",function(ev){
        if( !el.find(ev.target).length && !$(".themeSelector").find(ev.target).length ) hide();
      });
    };

    var disableZoomTab = function(){
      clearTimeout(resizeHandle);
      $(window).off("resize");
    };

    var enableZoomTab = function(){
      var pictureSelector = el.find(".body .zoom");
      var bodySelector = el.find("#zoom");
      bodySelector.css("visibility","hidden");
      pictureSelector
          .one("load",function(){
            setTimeout(function(){
              bodySelector.css("opacity",0);
              resizePicture();
              bodySelector
                  .css("visibility","visible")
                  .transition({opacity:1,easing: 'snap'}, 550);
            },250)
          });
      var h = pictureSelector.attr("src");
      pictureSelector.attr("src","").attr("src",h);

      $(window).off("resize").on("resize",function(){
        clearTimeout(resizeHandle);
        resizeHandle = setTimeout(function(){
          resizePicture();
        },10);
      });
    };

    var enableEditTab = function(){
      el.find('#edit form').get(0).reset();
      el.find('#edit .btn-primary')
          .removeClass("disabled")
          .on("click",function(){
            var that = this;
            if( ! $(that).hasClass("disabled") ){
              $(that).addClass("disabled");
              var img = el.find("#edit .edit_img");
              img.addClass("loading");
              $("#post_picture").one("load",function(){
                $("#edit .edit_img").one("load",function(){
                  $(that).removeClass("disabled");
                  img.removeClass("loading");
                });
                var h = img.attr("src");
                img.attr("src","").attr("src",h);
              });
            }
          });
    };

    var disableEditTab = function(){
      el.find('#edit .btn-primary').off("click");
    };

    var enableLogsTab = function(){
    };

    var disableLogsTab = function(){};

    el.find("a[href='#zoom']").on("click",function(){
      if( $(this).parent().hasClass("active") == false ){
        disableEditTab();
        disableLogsTab();
        enableZoomTab();
      }
    });

    el.find("a[href='#edit']").on("click",function(){
      if( $(this).parent().hasClass("active") == false ){
        disableLogsTab();
        disableZoomTab();
        enableEditTab();
      }
    });

    el.find("a[href='#logs']").on("click",function(){
      if( $(this).parent().hasClass("active") == false ){
        disableEditTab();
        disableZoomTab();
        enableLogsTab();
      }
    });

    return {
      model:model,
      el:el,
      onCloseClicked: function(fn){
        onCloseClicked = fn;
      },
      onNext: function(fn){
        onNextClicked = fn;
      },
      onPrev: function(fn){
        onPrevClicked = fn;
      },
      resizePicture: resizePicture,
      show: show,
      hide:hide,
      showTab:function(id){
        el.find("a[href='#"+id+"']").trigger("click");
      }
    };
  };


});