"use strict";
define([],function(){
  return function(  ){

    var that = this;

    var pictures = [
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTWfyd_BW14ss2E3WvZD2OjBsvqC0JxDkFXQ7FQTaE22AXC61x5",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRn5Alt2EIaIRkKIBF02YfAG9hRGodmFOcx4KfkkgB4tXOJlDaFkw",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvniGwJwg1_uwYAIky8iTp2u0LVXq4wtzl-M6VzRUrvPchSir7",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTEUgPA-SW13bhkNuP-P--6BF0KbAqIZ_EMjld8nKo9y6haUA_L",
      "http://preschooler.thebump.com/DM-Resize/photos.demandstudios.com/getty/article/117/100/87782441.jpg?w=600&h=600&keep_ratio=1",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ5w4HaqATtglk0KR3RD8mhVO8itYoaxX-SdKQVahJ4ttwyB1SP",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIRSXf4F6lcWCNvJZktdOg-Jm8i000ESHWDv9_eb2Oegxw0GfcVw",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwJcpzXGs7Vmfrhd5LuLVxWu_9gNvQNKUxXaWJqGR8d1vE9EMDfA",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsQ2StunY7yCCyjA9FAY-8BOpgzbk6VYTBIkkQVvfHWJVoPlWt1g",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoml7o6ihCJfgQWs01sUnlg_qZ4ZCnGrNXNTB8F89X2zWHVwovEQ",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTRurM06J-trtg_r8D0opJgViZqIHGI8TD7vDHWf7bUC46qT5diQw",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-fdfxKPYRL4FRlBXlhiyDFUxtSDmuy_DeBsS9l8uNGoYbmKiy",
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcR7igdKOyGRcUuGqPQ3vfdlskjtm89Z8-3QYeI5QGqfM0113Diw",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSOcdblf_1n5GmuEpU_I31uisrPEn0UrcpXJM_-VPUuNtSvnx9q_A",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNDLhuFTC-MzHS5nE9FV3u7XhWXuEDXMONH7_1eFsWlA48X1cUsA",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTWfyd_BW14ss2E3WvZD2OjBsvqC0JxDkFXQ7FQTaE22AXC61x5",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRn5Alt2EIaIRkKIBF02YfAG9hRGodmFOcx4KfkkgB4tXOJlDaFkw",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvniGwJwg1_uwYAIky8iTp2u0LVXq4wtzl-M6VzRUrvPchSir7",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTEUgPA-SW13bhkNuP-P--6BF0KbAqIZ_EMjld8nKo9y6haUA_L",
      "http://preschooler.thebump.com/DM-Resize/photos.demandstudios.com/getty/article/117/100/87782441.jpg?w=600&h=600&keep_ratio=1",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQ5w4HaqATtglk0KR3RD8mhVO8itYoaxX-SdKQVahJ4ttwyB1SP",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIRSXf4F6lcWCNvJZktdOg-Jm8i000ESHWDv9_eb2Oegxw0GfcVw",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwJcpzXGs7Vmfrhd5LuLVxWu_9gNvQNKUxXaWJqGR8d1vE9EMDfA",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsQ2StunY7yCCyjA9FAY-8BOpgzbk6VYTBIkkQVvfHWJVoPlWt1g",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoml7o6ihCJfgQWs01sUnlg_qZ4ZCnGrNXNTB8F89X2zWHVwovEQ",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTRurM06J-trtg_r8D0opJgViZqIHGI8TD7vDHWf7bUC46qT5diQw",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-fdfxKPYRL4FRlBXlhiyDFUxtSDmuy_DeBsS9l8uNGoYbmKiy",
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcR7igdKOyGRcUuGqPQ3vfdlskjtm89Z8-3QYeI5QGqfM0113Diw",
      "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSOcdblf_1n5GmuEpU_I31uisrPEn0UrcpXJM_-VPUuNtSvnx9q_A",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNDLhuFTC-MzHS5nE9FV3u7XhWXuEDXMONH7_1eFsWlA48X1cUsA"
    ];
    var array_shuffle = function(mixedArray1){

      mixedArray1.forEach(function (element, index, array) {
        var randomIndex = Math.floor(Math.random() * array.length);
        array[index] = array[randomIndex];
        array[randomIndex] = element;
      });
      return mixedArray1;
    }

    that.fetchConfig = function(){
      return {};
    };
    that.fetchDirectoryItems = function(path,from,items_by_page){
      var p = $.Deferred();
      var response = null;
      if(path=="/")
        response = {
          "items": [
            "\/Nouveau dossier\/"
          ],
          "total_count": 7,
          "from": 0,
          "items_by_page": 30
        };
      if(path == "/Nouveau dossier/")
        response = {
          "items": [
            "\/Nouveau dossier\/sdfds fsdf sdf sdf sfd fd shjkjhkjhkjhkhjk hkhjk hjkh jk jhkhjkhjkhjkhjkhjkhk\/"
          ],
          "total_count": 10,
          "from": 0,
          "items_by_page": 30
        };
      if(path == "/Nouveau dossier/sdfds fsdf sdf sdf sfd fd shjkjhkjhkjhkhjk hkhjk hjkh jk jhkhjkhjkhjkhjkhjkhk/")
        response = {
          "items": [
            "\/Nouveau dossier\/sdfds fsdf sdf sdf sfd fd shjkjhkjhkjhkhjk hkhjk hjkh jk jhkhjkhjkhjkhjkhjkhk\/dsqdqsd\/"
          ],
          "total_count": 1,
          "from": 0,
          "items_by_page": 30
        };
      if(path == "/Nouveau dossier/sdfds fsdf sdf sdf sfd fd shjkjhkjhkjhkhjk hkhjk hjkh jk jhkhjkhjkhjkhjkhjkhk/dsqdqsd/")
        response = {
          "items": [

          ],
          "total_count": 0,
          "from": 0,
          "items_by_page": 30
        };
      var e=Math.floor(Math.random()*pictures.length);
      for( var i=0;i<e;i++){
        var randomnumber=Math.floor(Math.random()*pictures.length);
        response.items.push(pictures[randomnumber])
      }
      response.items = array_shuffle(response.items);
      p.resolve(response);
      return p;
    };
    that.fetchDirectories = function(path,from,items_by_page){
      return {};
    };
    that.fetchPictures = function(path,from,items_by_page){
      return {};
    };
    that.trashFile = function(path){
      return {};
    };
    that.editPicture = function(path,message,file){
      return {};
    };
    that.fetchThemes = function(){
      var p = $.Deferred();
      var response = null;
      response = {
        "0": "\/assets\/themes\/amelia.bootstrap.min.css",
        "1": "\/assets\/themes\/cerulean.bootstrap.min.css",
        "2": "\/assets\/themes\/cosmo.bootstrap.min.css",
        "3": "\/assets\/themes\/cyborg.bootstrap.min.css",
        "4": "\/assets\/themes\/darkly.bootstrap.min.css",
        "5": "\/assets\/themes\/flatly.bootstrap.min.css",
        "7": "\/assets\/themes\/journal.bootstrap.min.css",
        "8": "\/assets\/themes\/lumen.bootstrap.min.css",
        "9": "\/assets\/themes\/readable.bootstrap.min.css",
        "10": "\/assets\/themes\/simplex.bootstrap.min.css",
        "11": "\/assets\/themes\/slate.bootstrap.min.css",
        "12": "\/assets\/themes\/spacelab.bootstrap.min.css",
        "13": "\/assets\/themes\/superhero.bootstrap.min.css",
        "14": "\/assets\/themes\/united.bootstrap.min.css",
        "15": "\/assets\/themes\/yeti.bootstrap.min.css"
      };
      p.resolve(response);
      return p;
    };

  }
});