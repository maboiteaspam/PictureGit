<?php

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
    if( preg_match("/[.]css$/i",$path)>0){
        header('Content-type: text/css');
    }else if( preg_match("/[.]js$/i",$path)>0){
        header('Content-type: text/javascript');
    }else{
        header('Content-type: '.mime_content_type($path));
    }
    if( !is_file($path) || !is_readable($path) ) return "";
    return file_get_contents($path);
}

function trash_file($path){
    if( is_file($path) ) return unlink($path);
    return false;
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

function relative_to($path, $items){
    foreach( $items as $i=>$v){
        $items[$i] = $path."/".$v;
        if( is_dir($items[$i]) ){
            $items[$i] = substr($items[$i],-1)=="/"?$items[$i]:$items[$i]."/";
        }
    }
    return $items;
}

/**
 * thanks to @ http://www.php.net/manual/en/function.shell-exec.php#67183
 *
 * @param $cmd
 * @param $stdout
 * @param $stderr
 * @param $stdin
 * @return int
 */
function cmd_exec($cmd, &$stdout, &$stderr, $stdin="")
{
    $outfile = tempnam(".", "cmd");
    $errfile = tempnam(".", "cmd");
    $descriptorspec = array(
        0 => array("pipe", "r"),
        1 => array("file", $outfile, "w"),
        2 => array("file", $errfile, "w")
    );
    $proc = proc_open($cmd, $descriptorspec, $pipes);

    if (!is_resource($proc)) return 255;

    fwrite($pipes[0],$stdin);
    fclose($pipes[0]);    //Don't really want to give any input

    $exit = proc_close($proc);
    $stdout = file($outfile);
    $stderr = file($errfile);

    unlink($outfile);
    unlink($errfile);
    return $exit;
}