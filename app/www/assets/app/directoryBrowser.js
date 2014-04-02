"use strict";
define(["app/utils"],function(utils){
  return function(el){

    var onItemClicked = function(item,ev){
//                console.log(arguments);
//                console.log("onItemClicked");
    };

    var model = {
      browseTo: ko.observable(),
      items:ko.observableArray([])
    };
    ko.applyBindings(model, $(el).get(0) );

    var fillWith = function(items){
      model.items.removeAll();
      model.items.push({
        path:"..",
        enabled:function(){
          return true;
        },
        name:"parent/..",
        onClick:function(item,ev){
          if( onItemClicked ) return onItemClicked(item, ev);
          return false;
        }
      });
      for(var n in items ){
        var item = items[n];
        model.items.push({
          path:item,
          name:utils.get_file_name(item),
          enabled:function(){
            return true;
          },
          onClick:function(item,ev){
            if( onItemClicked ) return onItemClicked(item, ev);
            return false;
          }
        });
      }
    };
    var fillEmpty = function(){
      return fillWith([]);
    };

    return {
      model:model,
      el:el,
      fillWith: fillWith,
      fillEmpty: fillEmpty,
      onItemClicked: function(fn){
        onItemClicked = fn;
      }
    };
  }
});