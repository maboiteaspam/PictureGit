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
    if( preg_match("/[.]css$/i",$path)>0){
        header('Content-type: text/css');
        if(etaged_file($path)!==false){
            $result = file_get_contents($path);
        }
    }else if( preg_match("/[.]js$/i",$path)>0){
        header('Content-type: text/javascript');
        if(etaged_file($path)!==false){
            $result = file_get_contents($path);
        }
    }else if( preg_match("/[.](jpeg|jpg|gif|png)$/i",$path)>0){
        $etag = etaged_file($path);
        if($etag!==false){
            $c = sys_get_temp_dir()."/cache";
            if( ! is_dir($c) ) mkdir($c,0777,true);
            $c = "$c/$etag";
            if( !file_exists($c) || filemtime($c) !== filemtime($path) ){
                $image = new SimpleImage();
                if( $image->load($path) ){
                    $image->resizeToHeight(250);
                    $image->save("$c",$image->image_type);
                }else{
                    $result = "wont image";
                }
            }
            if (preg_match("/[.](jpeg|jpg)$/i",$path)>0) {
                header('Content-Type: image/jpeg');
            } elseif (preg_match("/[.](gif)$/i",$path)>0) {
                header('Content-Type: image/gif');
            } elseif (preg_match("/[.](png)$/i",$path)>0) {
                header('Content-Type: image/png');
            }
            $result = file_get_contents($c);
        }
    }else{
        header('Content-type: '.mime_content_type($path));
        if(etaged_file($path)!==false){
            $result = file_get_contents($path);
        }
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
    if ( (int)$modified_since === (int)$last_modified && $etag === $etagHeader ) {
        header( "HTTP/1.1 304 Not Modified" );
        header("Cache-Control: must-revalidate");
        header("Pragma: ");
        header("Expires: ");
        return false;
    }
    header( "HTTP/1.1 200 ok" );
    header("Cache-Control: must-revalidate");
    header("Pragma: ");
    header("Expires: ");
    return $etag;
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
        if( preg_match("/".preg_quote($search)."/",$v) > 0 ){
            $retour[] = $items[$i];
        }
    }
    return $retour;
}
