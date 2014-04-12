"use strict";
define([],function(){
  return function(ajaxHelper){

    var that = this;

    that.fetchConfig = function(){
      return ajaxHelper.getJSON("/config");
    };
    that.fetchDirectoryItems = function(path){
      return ajaxHelper.getJSON("/list_directory/"+path);
    };
    that.fetchDirectories = function(path){
      return ajaxHelper.getJSON("/list_directories/"+path);
    };
    that.fetchPictures = function(path){
      return ajaxHelper.getJSON("/list_files/"+path);
    };
    that.trashFile = function(path){
      return ajaxHelper.getJSON("/trash_file/"+path);
    };
    that.fetchThemes = function(){
      return ajaxHelper.getJSON("/list_bootstrap_themes");
    };

  }
});