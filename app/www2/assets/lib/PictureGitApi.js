"use strict";
define([],function(){
  return function(ajaxHelper){

    var that = this;

    that.fetchConfig = function(){
      return ajaxHelper.getJSON("/config");
    };
    that.fetchDirectoryItems = function(path,from,items_by_page){
      var url = "/list_directory/"+path+"?";
      if( from ) url+= "from="+from+"&";
      if( items_by_page ) url+= "items_by_page="+items_by_page+"&";
      return ajaxHelper.getJSON(url);
    };
    that.fetchDirectories = function(path,from,items_by_page){
      var url = "/list_directories/"+path+"?";
      if( from ) url+= "from="+from+"&";
      if( items_by_page ) url+= "items_by_page="+items_by_page+"&";
      return ajaxHelper.getJSON(url);
    };
    that.fetchPictures = function(path,from,items_by_page){
      var url = "/list_files/"+path+"?";
      if( from ) url+= "from="+from+"&";
      if( items_by_page ) url+= "items_by_page="+items_by_page+"&";
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