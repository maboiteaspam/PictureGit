<?php

$cwd = getcwd()."/";
$picture_dir = getcwd()."/";
$app_dir = __DIR__."/";

$config_path = false;
$default_config = [
    "app_title"=>"My Super great app to manage pictures !",
    "pictures_path"=>"pictures_repo/",
    "www_path"=>"app/www/",
    "api_location"=>"http://some.host:80/",
    "git"=>[
        "enable"=>false,
        "auto_push"=>false,
        "remote"=>"name branch?",
    ],
    "template_message"=>[
        "update"=>"File updated by :user_name:\n\nReason is ",
        "trash"=>"File deleted by :user_name:\n\nReason is "
    ],
    "display"=>[
        "items_by_page"=>30,
    ],
];

require_once($app_dir."SimpleImage.php");
require_once($app_dir."lib.php");
require_once($app_dir."lib-git.php");

/** @var \VersionSystem\Base $VS */
$VS = new \VersionSystem\TrueStub("");

$config_path = getenv("PICUREGITCONFIG");
if( $config_path !== false ){
    $config_path = $cwd.getenv("PICUREGITCONFIG");

    $config = load_config_or_die($config_path);

    if( isset($config->pictures_path) ){
        $picture_dir = get_picture_path_or_die($config);
    }

    if( isset($config->git) ){
        if( !(isset($config->git->enable) && !$config->git->enable) ){
            $VS = new \VersionSystem\Git($picture_dir, $config->git);
        }
    }else if( isset($config->git_annex) ){
        if( !(isset($config->git_annex->enable) && !$config->git_annex->enable) ){
            $VS = new \VersionSystem\GitAnnex($picture_dir, $config->git_annex);
        }
    }
}else{
    $config = json_decode(json_encode($default_config));
}

if( ! $VS->isRootReady() ){
    $VS = new \VersionSystem\TrueStub("");
}

$www_dir = $config->www_path;
$assets_dir = $config->www_path."/assets/";
$items_by_page = $config->display->items_by_page;
$api_location = $config->api_location;


$routes = array();
$routes["`^/list_items(/.*)`i"] = function($path) use($picture_dir,$items_by_page){
    $type = isset($_GET["type"])?($_GET["type"]):"";
    $search = isset($_GET["search"])?($_GET["search"]):"";
    $from = isset($_GET["from"])?intval($_GET["from"]):0;
    $items_by_page = isset($_GET["items_by_page"])?intval($_GET["items_by_page"]):$items_by_page;
    $path = secure_path($picture_dir, $path );
    $items = read_directory($picture_dir.$path);
    if( $type == "file" ) $items = filter_files($picture_dir.$path, $items);
    if( $type == "directory" ) $items = filter_dirs($picture_dir.$path, $items);
    $items = relative_to($path, $items);
    $items = clean_paths($picture_dir, $items);
    if( $search != "" ) $items = match_paths("**$search**", $items);
    $length = count($items);
    $items = reduce($items,$from,$items_by_page);
    return respond_json(array(
        "items"=>$items,
        "total_count"=>$length,
        "from"=>$from,
        "items_by_page"=>$items_by_page,
    ));
};
$routes["`^/completion(/.*)$`"] = function($path) use($picture_dir){
    $search = isset($_GET["search"])?($_GET["search"]):"";
    $from = isset($_GET["from"])?intval($_GET["from"]):0;
    $items_by_page = isset($_GET["items_by_page"])?intval($_GET["items_by_page"]):5;
    $path = secure_path($picture_dir, $path );
    $items = read_directory($picture_dir.$path);
    $items = relative_to($path, $items);
    $items = clean_paths($picture_dir, $items);
    $items = match_paths("/$search**", $items);
    $length = count($items);
    $items = reduce($items,$from,$items_by_page);
    return respond_json(array(
        "items"=>$items,
        "total_count"=>$length,
        "from"=>$from,
        "items_by_page"=>$items_by_page,
    ));
};
$routes["`^/read_file(/.+)`i"] = function($path) use($picture_dir){
    $path = secure_path($picture_dir, $path);

    if( preg_match("/[.](jpeg|jpg|gif|png)$/i",$path)>0){
        $etag = etaged_file($picture_dir.$path);
        if($etag!==false){
            $c = sys_get_temp_dir()."/cache";
            if( ! is_dir($c) ) mkdir($c,0777,true);
            $c = "$c/$etag";
            if( !file_exists($c) || filemtime($c) !== filemtime($picture_dir.$path) ){
                $image = new SimpleImage();
                if( $image->load($picture_dir.$path) ){
                    $image->resizeToHeight(250);
                    $image->save("$c",$image->image_type);
                    touch($c,filemtime($picture_dir.$path));
                }else{
                    $c = $picture_dir.$path; // revert to original
                }
            }
            $path = $c; // apply c to path
        }
    }

    $retour = respond_file($path);
    header( "Cache-Control:must-revalidate, public" );
    return $retour;
};
$routes["`^/read_file(/[^@]+)@(.+)`i"] = function($f_path, $version) use($picture_dir){
    /**/
};
$routes["`^/edit_file(/.*)`i"] = function($path) use($picture_dir,$VS){
    if( isset($_FILES["img"]) ){
        $path = secure_path($picture_dir, $path );
        $contents = file_get_contents($_FILES["img"]["tmp_name"]);
        file_put_contents($picture_dir.$path,$contents);
        $comment = isset($_POST["comment"])?$_POST["comment"]:"";
        $VS->commit($picture_dir.$path,$comment);
        return respond_json("ok");
    }
    return respond_json("ko");
};
$routes["`^/new_file(.*)`i"] = function($d_path) use($picture_dir,$VS){
    if( isset($_FILES["img"]) ){
        $d_path = secure_path($picture_dir, $d_path );
        if( is_dir($picture_dir.$d_path) == false ){
            mkdir($picture_dir.$d_path,0777,true);
        }
        $name = $d_path."/".$_FILES["img"]["name"];
        $contents = file_get_contents($_FILES["img"]["tmp_name"]);
        file_put_contents($picture_dir."/".$name,$contents);
        $comment = isset($_POST["comment"])?$_POST["comment"]:"";
        $VS->commit($picture_dir."/".$name,$comment);
        return respond_json("ok");
    }
    return respond_json("ko");
};
$routes["`^/new_directory(.*)`i"] = function($d_path) use($picture_dir,$VS){
    if( isset($_POST["name"]) ){
        $name = isset($_POST["name"])?$_POST["name"]:"";
        $d_path = secure_path($picture_dir, $d_path );
        $name = preg_replace("/[^a-z0-9_ -]+/","",$name);
        if( is_dir($picture_dir.$d_path."/".$name) == false ){
            mkdir($picture_dir.$d_path."/".$name,0777,true);
        }
    }
};
$routes["`^/trash_file(/.+)`i"] = function($path) use($picture_dir, $VS){
    $path = secure_path($picture_dir, $path );
    $trashed = trash_file($picture_dir.$path);
    $trashed = $trashed && $VS->remove($picture_dir.$path);
    return respond_json( $trashed );
};
$routes["`^/trash_folder(/.+)`i"] = function($path) use($picture_dir, $VS){
    $path = secure_path($picture_dir, $path );
    $trashed = trash_folder($picture_dir.$path);
    $trashed = $trashed && $VS->remove($picture_dir.$path);
    return respond_json( $trashed );
};
$routes["`^/read_logs(/.+)`i"] = function($f_path) use($picture_dir){
    /**/
};
$routes["`^/list_bootstrap_themes`i"] = function() use($assets_dir,$www_dir){
    $retour = read_directory($assets_dir."/themes/");
    $retour = filter_pattern("`[^.]+[.]bootstrap[.]min[.]css$`", $retour);
    $retour = relative_to("/assets/themes/", $retour);
    $retour = clean_paths($assets_dir."/themes/", $retour);
    return respond_json($retour);
};
$routes["`^/config$`"] = function() use($config,$VS){
    return respond_json([
        "app_title"=>$config->app_title,
        "vcs_ready"=>get_class($VS)!=="\\VersionSystem\\TrueStub",
        "template_message"=>$config->template_message,
        "display"=>$config->display,
    ]);
};
$routes["`^/(|index[.](html|htm))$`"] = function() use($www_dir,$api_location){
    $files = array(
        "index.html",
        "index.htm",
    );
    foreach( $files as $f ){
        if( is_file("$www_dir/$f") ){
            return inject_script("window.api_location='$api_location';",respond_file("$www_dir/$f"));
        }
    }
    return false;
};
$routes["`^(/tests/.+)$`"] = function($path) use($app_dir){
    if( is_file("$app_dir/www-tests/$path") ){
        return respond_file("$app_dir/www-tests/$path");
    }
    return false;
};
$routes["`^/(.+)[.]mocha$`"] = function($path_url) use($www_dir,$api_location){
    $files = array(
        "$path_url.html",
        "$path_url.htm",
    );
    foreach( $files as $f ){
        if( is_file("$www_dir/$f") ){
            $c = respond_file("$www_dir/$f");
            // note the reversed order, easy way(....)
            $c = inject_css_file("/tests/mocha.css", $c);
            $c = inject_script("mocha.setup('bdd')", $c);
            $c = inject_css_file("/tests/vendors/mocha/mocha.css", $c);
            $c = inject_script_file("/tests/vendors/mocha/mocha.js", $c);
            $c = inject_script_file("/tests/vendors/mocha/expect.js", $c);
            // note the reversed order, easy way(....)
            $c = inject_script("mocha.run();", $c,'bottom');
            $c = inject_script("mocha.globals(['jQuery']);", $c,'bottom');
            $c = inject_script("mocha.checkLeaks();", $c,'bottom');
            $c = inject_script("$('<div id=\"mocha\"></div>').appendTo('body')", $c,'bottom');
            $c = inject_script_file("/tests/$path_url.js", $c,'bottom');
            return $c;
        }
    }
    return false;
};
$routes["catch_all"] = function($path) use($www_dir){
    $path = secure_path($www_dir, $path );
    if( is_file($www_dir.$path) ){
        return respond_file($www_dir.$path);
    }
    header ("HTTP/1.0 404 Not Found");
    return false;
};

$request_uri = isset($_SERVER["REQUEST_URI"])?$_SERVER["REQUEST_URI"]:"";
$q_str = isset($_SERVER["QUERY_STRING"])?$_SERVER["QUERY_STRING"]:"";
$request_uri = str_replace("?".$q_str,"",$request_uri);
$found = false;
$response = "";
foreach( $routes as $pattern => $handler ){
    if( $pattern != "catch_all" ){
        $matches = array();
        if( preg_match($pattern, $request_uri, $matches) ) {
            array_shift($matches);
            $response = call_user_func_array($handler,$matches);
            if( $response !== false ){
                $found = true;
                break;
            }
        }
    }
}
// router.php
if (!$found && isset($routes["catch_all"])) {
    $response = call_user_func_array($routes["catch_all"],array($request_uri));
    $found = true;
}
if( $response !== false ) echo $response;
return $found;
