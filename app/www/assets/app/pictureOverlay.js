"use strict";
define([],function(){

  return function(el){
    var onEditClick;
    var onZoomClick;
    var onTrashClick;
    var onLogsClick;
    return {
      show: function(target){
        el.find(".logs").off("click").on("click",function(ev){
          ev.preventDefault();
          if( onLogsClick ) return onLogsClick.apply(this,arguments);
          return false;
        });
        el.find(".edit").off("click").on("click",function(ev){
          ev.preventDefault();
          if( onEditClick ) return onEditClick.apply(this,arguments);
          return false;
        });
        el.find(".zoom").off("click").one("click",function(ev){
          ev.preventDefault();
          if( onZoomClick ) return onZoomClick.apply(this,arguments);
          return false;
        });
        el.find(".trash").off("click").on("click",function(ev){
          ev.preventDefault();
          if( onTrashClick ) return onTrashClick.apply(this,arguments);
          return false;
        });
        return el
            .hide()
            .appendTo( target )
            .addClass("loading")
            .show();
      },
      hide: function(){
        return el.hide().appendTo( "body" );
      },
      onEdit: function(fn){
        onEditClick = fn;
      },
      onZoom: function(fn){
        onZoomClick = fn;
      },
      onTrash: function(fn){
        onTrashClick = fn;
      },
      onLogs: function(fn){
        onLogsClick = fn;
      }
    };
  }

});