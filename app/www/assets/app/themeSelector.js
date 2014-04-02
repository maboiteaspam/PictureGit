"use strict";
define([],function(){

  return function(el){

    var onItemClicked = function(item,ev){
//                console.log(arguments);
//                console.log("onItemClicked");
    };

    var model = {
      current:ko.observable(),
      items:ko.observableArray([])
    };
    ko.applyBindings(model, $(el).get(0) );

    var fillWith = function(items){
      model.items.removeAll();
      for(var n in items ){
        var item = items[n];
        model.items.push({
          path:item,
          name:item.match(/[/]([^/.]+)[.]bootstrap[.]min[.]css$/)[1],
          selected:function(){
            return this.path == model.current();
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
  };

});