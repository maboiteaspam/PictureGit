<?php

function is_a_gitified_directory($path){

    $cwd = getcwd();
    chdir($path);

    $stderr = "";
    $stdout = "";
    $ret = cmd_exec("git status", $stdout, $stderr);
    /*  if( $ret === 0 ) var_dump($stdout);
        else var_dump($stderr); */
    chdir($cwd);

    return $ret===0;
}

function git_commit($path,$message){

    $cwd = getcwd();
    chdir($path);

    $stderr = "";
    $stdout = "";
    $ret = cmd_exec("git commit -a -F -", $stdout, $stderr,$message);
    chdir($cwd);

    return $ret===0;
}

function git_push($path,$remote){

    $cwd = getcwd();
    chdir($path);

    $stderr = "";
    $stdout = "";
    $ret = cmd_exec("git push $remote", $stdout, $stderr);
    chdir($cwd);

    return $ret===0;
}

function git_remove($path){

    $cwd = getcwd();
    chdir($path);

    $stderr = "";
    $stdout = "";
    $ret = cmd_exec("git rm $path", $stdout, $stderr);
    chdir($cwd);

    return $ret===0;
}
