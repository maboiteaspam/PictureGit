// pseudo test sequence
var r = function(then){
  setTimeout(function(){
    $(".display-thumbs ul .directory").first().click();
    setTimeout(function(){
      $(".display-thumbs ul .directory").first().click();
      setTimeout(function(){
        $(".display-thumbs ul .directory").first().click();
        setTimeout(function(){
          $(".container-pager .pull-left ul.nav")
              .first().find("li a").first().click();
          then(then);
        },1500);
      },1500);
    },1500);
  },1500);
};
