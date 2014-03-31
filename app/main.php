<?php

$cwd = getcwd()."/";
$picture_dir = getcwd()."/";
$app_dir = __DIR__."/";
$www_dir = __DIR__."/www/";
$assets_dir = __DIR__."/www/assets/";

$config_path = false;
$config = [
    "app_title"=>"My Super great app to manage pictures !",
    "pictures_path"=>"pictures_repo/",
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

$config_path = getenv("PICUREGITCONFIG");
if( $config_path !== false ){
    $config_path = $cwd.getenv("PICUREGITCONFIG");

    if( is_file($config_path) === false ){
        throw new \Exception("Application cannot start, config.json is missing in '$config_path'.");
    }else if( is_readable($config_path) === false ){
        throw new \Exception("Application cannot start, '$config_path' is not readable.");
    }
    $config = load_json_file($config_path);
    if( $config === false ){
        throw new \Exception("Application cannot start, '$config_path' is poorly JSON compatible.");
    }

    if( isset($config->pictures_path) ){
        if( is_dir($config->pictures_path) === false ){
            throw new \Exception("Application cannot start, pictures directory '$config->pictures_path' is missing.");
        }else if( is_readable($config->pictures_path) === false ){
            throw new \Exception("Application cannot start, pictures directory '$config->pictures_path' is not readable.");
        }
        $picture_dir = realpath($config->pictures_path);
    }

    if( isset($config->git) ){
        if( isset($config->git->enable) && !$config->git->enable ){
            $config->git = false;
        }else{
            if( is_a_gitified_directory($config->pictures_path) === false ){
                $config->git = false;
            }
        }

    }else{
        $config->git = false;
    }
}

$routes = array();
$routes["`^/list_directory/(.*)`i"] = function($path) use($picture_dir){
	$path = urldecode( $path );
	$retour = read_directory($picture_dir.$path);
	$retour = relative_to($path, $retour);
	return respond_json($retour);
};
$routes["`^/list_directories/(.*)`i"] = function($path) use($picture_dir){
	$path = urldecode( $path );
	$retour = read_directory($picture_dir.$path);
	$retour = filter_dirs($picture_dir.$path, $retour);
	$retour = relative_to($path, $retour);
	return respond_json($retour);
};
$routes["`^/list_files/(.*)`i"] = function($path) use($picture_dir){
	$path = urldecode( $path );
	$retour = read_directory($picture_dir.$path);
	$retour = filter_files($picture_dir.$path, $retour);
	$retour = relative_to($path, $retour);
	return respond_json($retour);
};
$routes["`^/read_file/(.+)`i"] = function($path) use($picture_dir){
	$path = urldecode( $path );
	return respond_file($picture_dir.$path);
};
$routes["`^/read_file/([^@]+)@(.+)`i"] = function($f_path, $version) use($picture_dir){
};
$routes["`^/edit_file/(.+)`i"] = function($path) use($picture_dir){
    var_dump($_FILES);
    var_dump($path);
};
$routes["`^/trash_file/(.+)`i"] = function($path) use($picture_dir){
    $path = urldecode( $path );
    return respond_json( trash_file($picture_dir.$path) );
};
$routes["`^/read_logs/(.+)`i"] = function($f_path) use($picture_dir){
};
$routes["`^/list_bootstrap_themes/`i"] = function() use($assets_dir,$www_dir){
	$retour = read_directory($assets_dir."/themes/");
	$retour = filter_pattern("`[^.]+[.]bootstrap[.]min[.]css$`", $retour);
	$retour = relative_to("/assets/themes/", $retour);
	return respond_json($retour);
};
$routes["`^/config$`"] = function() use($config){
    return respond_json($config);
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
