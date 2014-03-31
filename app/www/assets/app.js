"use strict";
(function(){

    function get_file_name(path){
        var k = path.match(/([^/]+)$/i);
        if( k ) k = k[1];
        else k = path;
        return k;
    }

    var topFactory = (function(){
        return function(el){
            var model = {
                appTitle: ko.observable(),
                currentPath: ko.observable()
            };
            ko.applyBindings(model, $(el).get(0) );

            return {
                model:model
            };
        }
    })();

    var directoryBrowserFactory = (function(){
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
                        name:get_file_name(item),
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
    })();

    var pictureBrowserFactory = (function(){
        return function(el){

            var onItemClicked = function(item,ev){
//                console.log(arguments);
//                console.log("onItemClicked");
            };

            var model = {
                items:ko.observableArray([])
            };
            ko.applyBindings(model, $(el).get(0) );

            var fillWith = function(items){
                model.items.removeAll();
                for(var n in items ){
                    var item = items[n];
                    model.items.push({
                        path:item,
                        name:get_file_name(item),
                        onClick:function(item,ev){
                            if( onItemClicked ) return onItemClicked(item, ev);
                            return false;
                        },
                        srcPath:function(){
                            return "/read_file/"+this.path;
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
    })();

    var themeSelectorFactory = (function(){
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
        }
    })();

    var pictureDetailsFactory = (function(){
        return function(el){

            var onCloseClicked = function(){};
            var onNextClicked = function(){};
            var onPrevClicked = function(){};

            var model = {
                path:ko.observable(""),
                srcPath:ko.observable(""),
                editPath:ko.observable(""),
                fileName:ko.observable(""),
                onClose:function(){
                    if( onCloseClicked ) onCloseClicked();
                    return false;
                },
                onNext:function(){
                    if( onNextClicked ) onNextClicked();
                    return false;
                },
                onPrev:function(){
                    if( onPrevClicked ) onPrevClicked();
                    return false;
                }
            };
            model.path.subscribe(function(newValue){
                newValue = newValue || "";
                model.editPath( "/edit_file/"+newValue );
                model.srcPath( "/read_file/"+newValue );
                model.fileName( get_file_name(newValue) );
            });
            ko.applyBindings(model, $(el).get(0) );

            var resizeHandle;

            var resizePicture = function(pictureSelector, bodySelector){
                pictureSelector = pictureSelector || ".body .zoom";
                bodySelector = bodySelector || ".body";

                pictureSelector = el.find(pictureSelector);
                bodySelector = el.find(bodySelector);

                pictureSelector
                    .css("width","auto")
                    .css("height","auto");

                var bh = bodySelector.height();
                var bw = bodySelector.width();
                var ih = pictureSelector.height();
                var iw = pictureSelector.width();

                var rh = bh/ih;
                var rw = bw/iw;

                var r = rh;
                if( rw < rh ) r = rw;

                pictureSelector.width(iw*r);
                pictureSelector.height(ih*r);
                pictureSelector.css( "margin-top", (bh-(ih*r)) /2 );
            };

            var hide = function(){
                el.hide();
                disableZoomTab();
                $("body").off("click");
            };

            var show = function(){
                el.show();
                $("body").off("click").on("click",function(ev){
                    if( !el.find(ev.target).length && !$(".themeSelector").find(ev.target).length ) hide();
                });
            };

            var disableZoomTab = function(){
                clearTimeout(resizeHandle);
                $(window).off("resize");
            };

            var enableZoomTab = function(){
                var pictureSelector = el.find(".body .zoom");
                var bodySelector = el.find("#zoom");
                bodySelector.css("visibility","hidden");
                pictureSelector
                    .off("load")
                    .on("load",function(){
                        setTimeout(function(){
                            bodySelector.css("opacity",0);
                            resizePicture();
                            bodySelector
                                .css("visibility","visible")
                                .transition({opacity:1,easing: 'snap'}, 550);
                        },250)
                    });
                var h = pictureSelector.attr("src");
                pictureSelector.attr("src","").attr("src",h);

                $(window).off("resize").on("resize",function(){
                    clearTimeout(resizeHandle);
                    resizeHandle = setTimeout(function(){
                        resizePicture();
                    },10);
                });
            };

            var enableEditTab = function(){
                el.find('#edit form').get(0).reset();
                el.find('#edit .btn-primary')
                    .removeClass("disabled")
                    .on("click",function(){
                        var that = this;
                        if( ! $(that).hasClass("disabled") ){
                            $(that).addClass("disabled");
                            var img = el.find("#edit .edit_img");
                            img.addClass("loading");
                            $("#post_picture").one("load",function(){
                                $("#edit .edit_img").one("load",function(){
                                    $(that).removeClass("disabled");
                                    img.removeClass("loading");
                                });
                                var h = img.attr("src");
                                img.attr("src","").attr("src",h);
                            });
                        }
                });
            };

            var disableEditTab = function(){
                el.find('#edit .btn-primary').off("click");
            };

            var enableLogsTab = function(){
            };

            var disableLogsTab = function(){};

            el.find("a[href='#zoom']").on("click",function(){
                disableEditTab();
                disableLogsTab();
                enableZoomTab();
            });

            el.find("a[href='#edit']").on("click",function(){
                disableLogsTab();
                disableZoomTab();
                enableEditTab();
            });

            el.find("a[href='#logs']").on("click",function(){
                disableEditTab();
                disableZoomTab();
                enableLogsTab();
            });

            var hideZoomTimeout;
            return {
                model:model,
                el:el,
                onCloseClicked: function(fn){
                    onCloseClicked = fn;
                },
                onNext: function(fn){
                    onNextClicked = fn;
                },
                onPrev: function(fn){
                    onPrevClicked = fn;
                },
                resizePicture: resizePicture,
                show: show,
                hide:hide,
                showZoom:function(){
                    el.find("a[href='#zoom']").trigger("click");
                },
                hideZoom:function(then){
                    el.find("#zoom").css("opacity",0);
                    clearTimeout(hideZoomTimeout);
                    hideZoomTimeout = setTimeout(function(){
                        if( then ) then();
                    },250);
                },
                showEdit:function(){
                    el.find("a[href='#edit']").trigger("click");
                },
                showLogs:function(){
                    el.find("a[href='#logs']").trigger("click");
                }
            };
        }
    })();

    var localStorageFactory = (function(){
        var storage = {};
        var has_local_storage = function(){
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        };

        if( has_local_storage() ){
            storage = window['localStorage'];
        }


        return function(){
            return {
                getValue:function(k){
                    return storage[k];
                },
                setValue:function(k,v){
                    return storage[k] = v;
                }
            }
        };
    })();

    var ajaxApiFactory = (function(){
        return function(base_url){
            base_url = base_url || "";
            var getJson = function(url,data){
                return $.ajax({
                    "url":base_url+url,
                    "data":data,
                });
            };
            var fetchDirectories = function(path){
                return getJson("/list_directories/"+path);
            };
            var fetchPictures = function(path){
                return getJson("/list_files/"+path);
            };
            var trashFile = function(path){
                return getJson("/trash_file/"+path);
            };
            var fetchThemes = function(){
                return getJson("/list_bootstrap_themes");
            };
            var fetchConfig = function(){
                return getJson("/config");
            };
            return {
                fetchConfig: fetchConfig,
                fetchDirectories: fetchDirectories,
                fetchPictures: fetchPictures,
                trashFile: trashFile,
                fetchThemes: fetchThemes
            };
        }
    })();

    var pictureOverlayFactory = (function(){
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
    })();


    // instance declaration starts here
    var localStorage = localStorageFactory("");
    var api = ajaxApiFactory("");
    var topView = topFactory( $(".top") );
    var directoryBrowser = directoryBrowserFactory( $(".directoryBrowser") );
    var pictureBrowser = pictureBrowserFactory( $(".picturesBrowser") );
    var themeSelector = themeSelectorFactory( $(".themeSelector") );
    var pictureDetails = pictureDetailsFactory( $(".pictureDetails") );
    var pictureOverlay = pictureOverlayFactory( $(".pictureOverlay") );

    directoryBrowser.model.browseTo.subscribe(function(newValue) {
        directoryBrowser.el.addClass("loading");
        api.fetchDirectories(newValue)
            .done(function(data){
                directoryBrowser.fillWith(data);
            })
            .fail(function(){
                directoryBrowser.fillEmpty();
            })
            .always(function(){
                directoryBrowser.el.removeClass("loading");
            });
    });

    directoryBrowser.model.browseTo.subscribe(function(newValue) {
        pictureBrowser.el.addClass("loading");
        api.fetchPictures(newValue)
            .done(function(data){
                pictureBrowser.fillWith(data);
            })
            .fail(function(){
                pictureBrowser.fillEmpty();
            })
            .always(function(){
                pictureBrowser.el.removeClass("loading");
            });
    });

    directoryBrowser.model.browseTo.subscribe(function(newValue) {
        topView.model.currentPath(newValue);
    });

    directoryBrowser.onItemClicked(function(item,ev) {

        $(".pictureOverlay").hide().appendTo( "body" );

        var path = "";
        if( item.path === ".." ){
            path = directoryBrowser.model.browseTo();
            path = path.replace("//","/");
            path = path[path.length-1]=="/"?path.substr(0,path.length-1):path;
            path = path.split("/");
            path.shift();
            path.pop();
            path = path.join("/");

            path = path=="/"?"":path;
            path = path==""?"":"/"+path+"/";
        }else{
            path = item.path;
        }
        directoryBrowser.model.browseTo(path);

        ev.preventDefault();
        return false;
    });

    pictureDetails.onCloseClicked(function(){
        pictureDetails.el.hide();
    });

    pictureBrowser.el.on( "click", "div > a ", function(ev) {
        ev.preventDefault();
    });
    pictureBrowser.el.on( "mouseenter", "img", function() {
        var li = $(this).parent().parent();
        var tooltip = li.find(".tooltip");
        var cur_index = li.index();
        var item = pictureBrowser.model.items()[ cur_index ];
        var img = $(this);

        pictureBrowser.el
            .find(".active").removeClass("active");

        img.stop(true,true)
            .transition({ boxShadow: "0 0 2em" })
            .parent().addClass("active");

        tooltip.css("top",0)
            .show()
            .stop(true,true)
            .transition({top:"-"+tooltip.height(), opacity:1});

        pictureOverlay.show( $(this).parent() )
            .width( img.outerWidth() )
            .height( img.outerHeight() )
            .css( "left", (img.parent().width()-img.outerWidth())/2 );

        li.on( "mouseleave", function() {
            tooltip.stop(true,true)
                .transition({opacity:0}).hide();
            img.stop(true,true)
                .transition({ boxShadow: "0 0 0" });
            pictureOverlay.hide();
            $(this).parent().removeClass("active");
        });

        pictureOverlay.onTrash(function(){
            api.trashFile(item.path).done(function(){
                $(".pictureOverlay").trigger("mouseleave");
                pictureBrowser.model.items.remove(item);
                pictureBrowser.el
                    .find("img:eq("+cur_index+")").trigger("mouseenter");
            });
            return false;
        });
        pictureOverlay.onLogs(function(){
            $(".pictureOverlay").trigger("mouseleave");
            pictureDetails.model.path(item.path);
            pictureDetails.showLogs();
            return false;
        });
        pictureOverlay.onEdit(function(){
            $(".pictureOverlay").trigger("mouseleave");
            pictureDetails.model.path(item.path);
            pictureDetails.show();
            pictureDetails.showEdit();
            return false;
        });
        pictureOverlay.onZoom(function(){
            $(".pictureOverlay").trigger("mouseleave");
            pictureDetails.model.path(item.path);
            pictureDetails.show();
            pictureDetails.showZoom();
            return false;
        });

        pictureDetails.onNext(function(){
            var l = pictureBrowser.model.items().length;
            if( cur_index+1 < l){
                cur_index++;
            }else if( l > 0 ){
                cur_index = 0;
            }
            if( cur_index < l ){
                item = pictureBrowser.model.items()[ cur_index ];
            }

            pictureDetails.hideZoom(function(){
                pictureDetails.model.path(item.path);
                pictureDetails.showZoom();
            });
        });
        pictureDetails.onPrev(function(){
            var l = pictureBrowser.model.items().length;
            if( cur_index-1 > 0){
                cur_index--;
            }else if( l > 0 ){
                cur_index = l-1;
            }
            if( cur_index < l ){
                item = pictureBrowser.model.items()[ cur_index ];
            }

            pictureDetails.hideZoom(function(){
                pictureDetails.model.path(item.path);
                pictureDetails.showZoom();
            });
        });
    });





    // app starts here
    directoryBrowser.model.browseTo("/");
    topView.model.appTitle("App title");
    var css_el = $("#bootstrap");
    themeSelector.el.addClass("loading");
    themeSelector.onItemClicked(function(item){
        themeSelector.model.current( item.path );
        css_el.attr("href", item.path );
        localStorage.setValue("preferred_theme", item.path );
    });
    var preferred = localStorage.getValue("preferred_theme");
    if( preferred ) {
        css_el.attr("href", preferred );
    }
    themeSelector.model.current( css_el.attr("href") );
    api.fetchThemes()
        .done(function(data){
            themeSelector.fillWith(data);
        })
        .fail(function(){
            themeSelector.fillEmpty();
            themeSelector.el.hide();
        })
        .always(function(){
            themeSelector.el.removeClass("loading");
            setTimeout(function(){
                $(".app-loader").transition({opacity:0},function(){
                    $(".app-loader").remove();
                });
                $("html").css("overflow","auto");
            },1000);
        });

    api.fetchConfig()
        .done(function(data){
            topView.model.appTitle(data.app_title)
        });

})();
