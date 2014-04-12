<?php

$cwd = getcwd()."/";
$picture_dir = getcwd()."/";
$app_dir = __DIR__."/";

$config_path = false;
$default_config = [
    "app_title"=>"My Super great app to manage pictures !",
    "pictures_path"=>"pictures_repo/",
    "www_path"=>"app/www/",
    "git"=>[
        "enable"=>false,
        "auto_push"=>false,
        "remote"=>"name branch?",
    ],
    "template_message"=>[
        "update"=>"File updated by :user_name:\n\nReason is ",
        "trash"=>"File deleted by :user_name:\n\nReason is "
    ],
];

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



$routes = array();
$routes["`^/list_directory(/.*)`i"] = function($path) use($picture_dir){
    $path = urldecode( $path );
    $retour = read_directory($picture_dir.$path);
    $retour = relative_to($path, $retour);
    $retour = clean_paths($picture_dir.$path, $retour);
    return respond_json($retour);
};
$routes["`^/list_directories(/.*)`i"] = function($path) use($picture_dir){
    $path = urldecode( $path );
    $retour = read_directory($picture_dir.$path);
    $retour = filter_dirs($picture_dir.$path, $retour);
    $retour = relative_to($path, $retour);
    $retour = clean_paths($picture_dir.$path, $retour);
    return respond_json($retour);
};
$routes["`^/list_files(/.*)`i"] = function($path) use($picture_dir){
    $path = urldecode( $path );
    $retour = read_directory($picture_dir.$path);
    $retour = filter_files($picture_dir.$path, $retour);
    $retour = relative_to($path, $retour);
    $retour = clean_paths($picture_dir.$path, $retour);
    return respond_json($retour);
};
$routes["`^/read_file(/.+)`i"] = function($path) use($picture_dir){
    $path = urldecode( $path );
    return respond_file($picture_dir.$path);
};
$routes["`^/read_file(/[^@]+)@(.+)`i"] = function($f_path, $version) use($picture_dir){
};
$routes["`^/edit_file(/.+)`i"] = function($path) use($picture_dir){
    var_dump($_FILES);
    var_dump($path);
};
$routes["`^/trash_file(/.+)`i"] = function($path) use($picture_dir, $VS){
    $path = urldecode( $path );
    $trashed = trash_file($picture_dir.$path);
    $trashed = $trashed && $VS->remove($picture_dir.$path);
    return respond_json( $trashed );
};
$routes["`^/read_logs(/.+)`i"] = function($f_path) use($picture_dir){
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
    ]);
};
$routes["`^/$`"] = function() use($www_dir){
    if( is_file("$www_dir/index.html") ){
        return respond_file("$www_dir/index.html");
    }
    if( is_file("$www_dir/index.htm") ){
        return respond_file("$www_dir/index.htm");
    }
    return false;
};
$routes["catch_all"] = function($path) use($www_dir){
    if( is_file($www_dir.$path) ){
        return respond_file($www_dir.$path);
    }
    return false;
};

$request_uri = isset($_SERVER["REQUEST_URI"])?$_SERVER["REQUEST_URI"]:"";
$q_str = isset($_SERVER["QUERY_STRING"])?$_SERVER["QUERY_STRING"]:"";
$request_uri = str_replace("?".$q_str,"",$request_uri);
$found = false;
foreach( $routes as $pattern => $handler ){
    if( $pattern != "catch_all" ){
        $matches = array();
        if( preg_match($pattern, $request_uri, $matches) ) {
            array_shift($matches);
            echo call_user_func_array($handler,$matches);
            $found = true;
            break;
        }
    }
}
// router.php
if (!$found && isset($routes["catch_all"])) {
    echo call_user_func_array($routes["catch_all"],array($request_uri));
    $found = true;
}
return $found;
