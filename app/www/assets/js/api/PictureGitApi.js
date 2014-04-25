"use strict";
define([],function(){
  return function(ajaxHelper){

    var that = this;

    that.fetchConfig = function(){
      return ajaxHelper.getJSON("/config");
    };
    that.completion = function(path,search){
      var url = "/completion"+path+"?";
      if( search ) url+= "search="+search+"&";
      return ajaxHelper.getJSON(url);
    };
    that.listItems = function(path,from,items_by_page,search,type){
      var url = "/list_items"+path+"?";
      if( from ) url+= "from="+from+"&";
      if( items_by_page ) url+= "items_by_page="+items_by_page+"&";
      if( search ) url+= "search="+search+"&";
      if( type ) url+= "type="+type+"&";
      return ajaxHelper.getJSON(url);
    };
    that.trashFile = function(path){
      return ajaxHelper.getJSON("/trash_file/"+path);
    };
    that.trashFolder = function(path){
      return ajaxHelper.getJSON("/trash_folder/"+path);
    };
    that.editPicture = function(path,comment,file){
      var data = new FormData();
      data.append("img", file);
      data.append("comment", comment);
      return ajaxHelper.uploadJSON("/edit_file"+path,data);
    };
    that.addPicture = function(path,comment,file){
      var data = new FormData();
      data.append("img", file);
      data.append("comment", comment);
      return ajaxHelper.uploadJSON("/new_file"+path,data);
    };
    that.addDirectory = function(path,name){
      return ajaxHelper.postJSON("/new_directory"+path,{name:name});
    };
    that.fetchThemes = function(){
      return ajaxHelper.getJSON("/list_bootstrap_themes");
    };
    that.fetchConfig = function(){
      return ajaxHelper.getJSON("/config");
    };

  }
});