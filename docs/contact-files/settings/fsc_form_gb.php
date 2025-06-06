<?php
//do not allow direct access
if ( strpos(strtolower($_SERVER['SCRIPT_NAME']),strtolower(basename(__FILE__))) ) {
  header('HTTP/1.0 403 Forbidden');
  exit('Forbidden');
}
//**AUTO-GENERATED DATA, DO NOT HAND EDIT!**
//Settings for 'Fast Secure Contact Form' PHP Script
$array = array (
  'donated' => 'false',
  'max_forms' => 4,
  'max_fields' => '4',
  'akismet_enable' => 'false',
  'akismet_api_key' => '',
);
?>