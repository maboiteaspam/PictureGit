<?php
require_once("lib.php");

$base_dir = __DIR__ . "/";
$assets_dir = __DIR__ . "/assets/";

$routes = array();
$routes["`^/list_directory/(.+)`i"] = function($path) use($base_dir){
	$path = urldecode( $path );
	$retour = read_directory($base_dir.$path);
	$retour = relative_to($path, $retour);
	return respond_json($retour);
};
$routes["`^/list_directories/(.+)`i"] = function($path) use($base_dir){
	$path = urldecode( $path );
	$retour = read_directory($base_dir.$path);
	$retour = filter_dirs($base_dir.$path, $retour);
	$retour = relative_to($path, $retour);
	return respond_json($retour);
};
$routes["`^/list_files/(.+)`i"] = function($path) use($base_dir){
	$path = urldecode( $path );
	$retour = read_directory($base_dir.$path);
	$retour = filter_files($base_dir.$path, $retour);
	$retour = relative_to($path, $retour);
	return respond_json($retour);
};
$routes["`^/read_file/(.+)`i"] = function($path) use($base_dir){
	$path = urldecode( $path );
	return respond_file($base_dir.$path);
};
$routes["`^/read_file/([^@]+)@(.+)`i"] = function($f_path, $version) use($base_dir){
};
$routes["`^/edit_file/(.+)`i"] = function($path) use($base_dir){
    var_dump($_FILES);
    var_dump($path);
};
$routes["`^/trash_file/(.+)`i"] = function($path) use($base_dir){
    $path = urldecode( $path );
    return respond_json( trash_file($base_dir.$path) );
};
$routes["`^/read_logs/(.+)`i"] = function($f_path) use($base_dir){
};
$routes["`^/list_bootstrap_themes/`i"] = function() use($assets_dir,$base_dir){
	$retour = read_directory($assets_dir."/themes/");
	$retour = filter_pattern("`[^.]+[.]bootstrap[.]min[.]css$`", $retour);
	$retour = relative_to("/".str_replace($base_dir,"",$assets_dir."themes/"), $retour);
	return respond_json($retour);
};
$routes["catch_all"] = function($path) use($base_dir){
	if( file_exists($base_dir.$path) ){
		return respond_file($base_dir.$path);
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
