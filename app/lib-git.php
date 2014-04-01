<?php
namespace VersionSystem;

abstract class Base {
    protected $path;
    protected $options;
    public $last_err = "";
    public $last_output = "";
    public function __construct($path,$options=array()){
        $this->path = $path;
        $this->options = $options;
    }
    protected function cmd_exec($cmd, $stdin="")
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
        $this->last_output = file($outfile);
        $this->last_err = file($errfile);

        unlink($outfile);
        unlink($errfile);
        return $exit;
    }


    public abstract function isRootReady();
    public abstract function commit($path,$message);
    public abstract function push($path);
    public abstract function remove($path);
}

class TrueStub extends Base{
    public function isRootReady(){
        return true;
    }
    public function commit($path,$message,$options=array()){
        return true;
    }
    public function push($path,$options=array()){
        return true;
    }
    public function remove($path,$options=array()){
        return true;
    }
}

class Git extends Base {
    protected function cmd_exec($cmd, $stdin=""){
        $cwd = getcwd();
        chdir($this->path);
        $ret = parent::cmd_exec($cmd,$stdin);
        chdir($cwd);
        return $ret;
    }
    public function isRootReady(){
        return $this->cmd_exec("git status")===0;
    }
    public function commit($path,$message,$options=array()){
        $path = realpath($path);
        return $this->cmd_exec("git commit -F - $path",$message)===0;
    }
    public function push($options=array()){
        $remote = isset($options["remote"])?$options["remote"]:"";
        return $this->cmd_exec("git push $remote")===0;
    }
    public function remove($path,$options=array()){
        $path = realpath($path);
        return $this->cmd_exec("git rm $path")===0;
    }
}

class GitAnnex extends Git {
    public function isRootReady(){
        return $this->cmd_exec("git annex status")===0;
    }
    public function commit($path,$message,$options=array()){
        $path = realpath($path);
        return $this->cmd_exec("git annex commit -F - $path",$message)===0;
    }
    public function push($options=array()){
        $remote = isset($options["remote"])?$options["remote"]:"";
        return $this->cmd_exec("git annex push $remote")===0;
    }
    public function remove($path,$options=array()){
        $path = realpath($path);
        return $this->cmd_exec("git annex rm $path")===0;
    }
}
