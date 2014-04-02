"use strict";
define([],function(){
  return function(base_url){
    base_url = base_url || "";
    var getJson = function(url,data){
      return $.ajax({
        "url":base_url+url,
        "data":data
      });
    };
    return {
      fetchConfig: function(){
        return getJson("/config");
      },
      fetchDirectories: function(path){
        return getJson("/list_directories/"+path);
      },
      fetchPictures: function(path){
        return getJson("/list_files/"+path);
      },
      trashFile: function(path){
        return getJson("/trash_file/"+path);
      },
      fetchThemes: function(){
        return getJson("/list_bootstrap_themes");
      }
    };
  }
});