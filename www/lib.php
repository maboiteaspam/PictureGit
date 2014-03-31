<?php

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
			$items[$i] = $path.$v;
			if( is_dir($items[$i]) ){
				$items[$i] = substr($items[$i],-1)=="/"?$items[$i]:$items[$i]."/";
			}
	}
	return $items;
}
