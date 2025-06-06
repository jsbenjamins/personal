<?php
// show php errors, only include while testing!
//include("error_display.php");
// add private db connector class
include("connectLime.php");

// open connection
$limecxn = new cxnLime();

// get username from the data in the ajax statement in limesurvey
$username = $_POST["username"];

// use the username to build a db query
$query = "select firstname from lime_tokens_84169 where completed!='N' order by firstname desc";
// run the db query and save result
$result = $limecxn->getres($query);

// fetch proper results
$columns = mysqli_fetch_fields($result);
$row = mysqli_fetch_row($result);

// write to variable
$test =  $row[0];

echo $test;

// close db connection!
$limecxn->disconnect();
?>