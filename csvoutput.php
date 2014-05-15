<?php

/*******************************************************************************
file: csvoutput.php 
project: Bracket Advisor
date: March 2013
author: P. Bustamante

overview: generates two csv files (data/top_matchups.csv and data/top_teams.csv) at 15-minute intervals from production database for use in the leaderboard. The csvs are generated on beta and then rsynced to production in a cron job.

*******************************************************************************/

## connect to production database	
	$connection = new mysqli("tdmysql", "tddba", "d@t@4All", "sports");
	if ($connection->connect_errno) {
		echo "Failed to connect to MySQL: (" . $connection->connect_errno . ") " . $connection->connect_error;
	}

## variables to hold data retrieved from database
$matchdata;
$teamdata;

	## get top five matchups selected
	$sql = "SELECT matchup, matchup_names, count(matchup_names) as tops 
						from ncaa_topmatchups 
						group by matchup_names 
						order by tops desc 
						limit 5";
	$results = $connection->query($sql);
	while($matchdata[]=mysqli_fetch_row($results));

	## get top 10 teams selected
	$sql = "SELECT team_name, count(team_name) as tops 
						from ncaa_topteams
						group by team_name
						order by tops desc 
						limit 10";
	$results = $connection->query($sql);
	while($teamdata[]=mysqli_fetch_row($results));
	
## open data/top_matchups.csv on beta
$fp1 = fopen('/var/www/html/madness/data/top_matchups.csv', 'wb');

## write column names to csv file
$fieldnames1 = "matchup,matchup_names,topm_counts\n";
fwrite($fp1, $fieldnames1);

## write top matchups data to file as csv
for($i=0; $i<5; $i++) {
	 fputcsv($fp1,$matchdata[$i]);
}
fclose($fp1);

## open data/top_teams.csv on beta
$fp2 = fopen('/var/www/html/madness/data/top_teams.csv', 'wb');

## write column names to csv file
$fieldnames2 = "team_name,topt_counts\n";
fwrite($fp2, $fieldnames2);

## write top matchups data to file as csv
for($i=0; $i<10; $i++) {
	 fputcsv($fp2,$teamdata[$i]);
}
fclose($fp2);

?>