
describe('a suite of tests', function(){
  this.timeout(50000);

  beforeEach(function(done){
    setTimeout(function(){
      $(".display_type[data-type='directory']").trigger("click");
      $(".display-thumbs .directory a[title='test']")
          .parent()
          .find(".btn-trash")
          .trigger("click");
      $(".modal textarea").val("commit message");
      $(".modal .confirm").trigger("click");
      setTimeout(done,2000);
    },3500);
  });

  it('create a new folder', function(done){
    var c = $(".pagination-status a span:eq(2)").text().match(/(\d+).+/)[1];
    c = parseInt(c);
    $(".display_type[data-type='directory']").trigger("click");
    $(".newSelector").trigger("click");
    $(".btn-new-directory").trigger("click");
    $(".new-directory input[name='name']").val("test");
    $(".new-directory .submit").trigger("click");
    setTimeout(function(){
      expect($(".display-thumbs .directory a[title='test']").length).to.eql(1);
      expect($(".breadcrumb_next .dropdown-menu a[title='test']").length).to.eql(1);
      c++;
      expect(parseInt($(".pagination-status a span:eq(2)").text().match(/(\d+).+/)[1])).to.eql(c);
      done();
    }, 1500);
  });

});