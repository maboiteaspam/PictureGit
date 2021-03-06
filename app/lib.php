<?php

function load_config_or_die($config_path){
    if( is_file($config_path) === false ){
        throw new \Exception("Application cannot start, config.json is missing in '$config_path'.");
    }else if( is_readable($config_path) === false ){
        throw new \Exception("Application cannot start, '$config_path' is not readable.");
    }
    $config = load_json_file($config_path);
    if( $config === false ){
        throw new \Exception("Application cannot start, '$config_path' is poorly JSON compatible.");
    }
    return $config;
}

function get_picture_path_or_die($config){
    if( is_dir($config->pictures_path) === false ){
        throw new \Exception("Application cannot start, pictures directory '$config->pictures_path' is missing.");
    }else if( is_readable($config->pictures_path) === false ){
        throw new \Exception("Application cannot start, pictures directory '$config->pictures_path' is not readable.");
    }
    return realpath($config->pictures_path);
}

function load_json_file($path){
    $retour = [];
    if( is_file($path) ){
        try{
            $retour = json_decode(file_get_contents($path));
        }catch (\Exception $e){}
    }
    return $retour;
}

function respond_json($data){
    header('Content-type: application/json');
    return json_encode($data, JSON_PRETTY_PRINT);
}

function respond_file($path){
    $result = "";
    if( !is_file($path) || !is_readable($path) ) return $result;


    if (preg_match("/[.](jpeg|jpg)$/i",$path)>0) {
        header('Content-Type: image/jpeg');

    } elseif (preg_match("/[.](gif)$/i",$path)>0) {
        header('Content-Type: image/gif');

    } elseif (preg_match("/[.](png)$/i",$path)>0) {
        header('Content-Type: image/png');

    } elseif (preg_match("/[.](css$)$/i",$path)>0) {
        header('Content-Type: text/css');

    } elseif (preg_match("/[.](js$)$/i",$path)>0) {
        header('Content-Type: text/javascript');

    } else {
        header('Content-type: '.mime_content_type($path));
    }

    if(etaged_file($path)!==false){
        $result = file_get_contents($path);
    }

    return $result;
}
function etaged_file($path){
    clearstatcache();
    $last_modified  = filemtime( $path );

    $modified_since = ( isset( $_SERVER["HTTP_IF_MODIFIED_SINCE"] )
        ? strtotime( $_SERVER["HTTP_IF_MODIFIED_SINCE"] ) : false );
    $etagHeader     = ( isset( $_SERVER["HTTP_IF_NONE_MATCH"] )
        ? trim( $_SERVER["HTTP_IF_NONE_MATCH"] ) : false );

    $etag = sha1(sha1_file($path).$last_modified);

    //set last-modified header
    header( "Last-Modified: ".gmdate( "D, d M Y H:i:s", $last_modified )." GMT" );
    //set etag-header
    header( "Etag: ".$etag );

    // if last modified date is same as "HTTP_IF_MODIFIED_SINCE", send 304 then exit
    if ( (int)$modified_since === (int)$last_modified
        && $etag === $etagHeader ) {
        header( "HTTP/1.1 304 Not Modified" );
        header( "Cache-Control:max-age=60, public" );
        return false;
    }
    header( "HTTP/1.1 200 ok" );
    header( "Cache-Control:max-age=60, public" );
    return $etag;
}
function inject_script($content,$in,$where="top"){
    // can be improved later.
    if( $where == "top" ) $in = str_replace("<head>","<head><script>$content</script>",$in);
    if( $where == "bottom" ) $in = str_replace("</body>","</body><script>$content</script>",$in);
    return $in;
}
function inject_script_file($url,$in,$where="top"){
    // can be improved later.
    if( $where == "top" ) $in = str_replace("<head>","<head><script src='$url'></script>",$in);
    if( $where == "bottom" ) $in = str_replace("</body>","</body><script src='$url'></script>",$in);
    return $in;
}
function inject_css_file($url,$in,$where="top"){
    // can be improved later.
    if( $where == "top" ) $in = str_replace("<head>","<head><link href='$url' rel='stylesheet' type='text/css'>",$in);
    if( $where == "bottom" ) $in = str_replace("</body>","</body><link href='$url' rel='stylesheet' type='text/css'>",$in);
    return $in;
}

function trash_file($path){
    if( is_file($path) ) return unlink($path);
    return false;
}

function trash_folder($path){
    if( is_dir($path) ){
        $it = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($path,
                RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );

        $sucess = true;
        foreach($it as $entry) {
            if ($entry->isDir()) {
                try {
                    rmdir($entry->getPathname());
                }
                catch (Exception $ex) {
                    $sucess = false;
                }
            }
            else {
                unlink($entry->getPathname());
            }
        }
        return $sucess && rmdir($path);
    }
    return false;
}

function secure_path($within, $path){
    $path = urldecode($path);
    $path = str_replace("//","/",$path);
    $within = realpath($within);
    $real = realpath($within.$path);
    if( $real != false ){
        $path = substr($real,strlen($within));
    }else{
        $path = "/";
    }
    return $path;
}

function read_directory($path){
    $retour = array();
    if( is_dir($path) ){
        $retour = scandir($path);
        array_shift($retour);
        array_shift($retour);
    }
    return $retour;
}

function filter_pattern($pattern, $items){
    foreach( $items as $i=>$v){
        if( preg_match($pattern,$v) === 0 ){
            unset($items[$i]);
        }
    }
    return $items;
}

function filter_files($path, $items){
    foreach( $items as $i=>$v){
        if( is_file($path."/".$v) === false ){
            unset($items[$i]);
        }
    }
    return $items;
}

function filter_dirs($path, $items){
    foreach( $items as $i=>$v){
        if( is_dir($path."/".$v) === false ){
            unset($items[$i]);
        }
    }
    return $items;
}

function reduce($items, $from, $by){
    $retour = array();
    $by = $by<=0?count($items):$by;
    $i = 0;
    foreach( $items as $index=>$v){
        $i++;
        if( $i>=$from && $i<$from+$by ){
            $retour[] = $items[$index];
        }
    }
    return $retour;
}

function relative_to($path, $items){
    foreach( $items as $i=>$v){
        $items[$i] = $path."/".$v;
    }
    return $items;
}

function clean_paths($path,$items){
    foreach( $items as $i=>$v){
        if( is_dir($path.$v) && substr($v,-1)!="/" ){
            $items[$i] .= "/";
        }
        $items[$i] = preg_replace("`([/]+)`i","/",$items[$i]);
    }
    return $items;
}

function match_paths($search,$items){
    $retour = array();
    foreach( $items as $i=>$v){
        if( fnmatch("$search", $v) ){
            $retour[] = $items[$i];
        }
    }
    return $retour;
}
