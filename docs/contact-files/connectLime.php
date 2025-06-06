<?php
class cxnLime {
    
    private $host = '85.158.203.26';
    private $u = 'jsbenjam';
    private $p = 'MS*j3r03n80';
    private $database = 'jsbenjam';
    
    protected $link;
    
    function __construct() {
        $this->link = mysqli_connect($this->host, $this->u, $this->p, $this->database) or die("Could not connect to LimeSurvey database.");
        unset($this->host);
        unset($this->u);
        unset($this->p);
        unset($this->database);
    }    
   
    function disconnect() {
        mysqli_close($this->link);
    }
    
    function getres($q) {
        $results = array();
        $results = mysqli_query($this->link, $q);
        
        return $results;
    }
}
?>