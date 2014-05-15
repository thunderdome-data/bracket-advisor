<?php

/*******************************************************************************
file: leaderboard.php
project: Bracket Advisor
date: March 2013
author: P. Bustamante

overview: captures user's team selections in tables sports.ncaa_topmatchups and sports.ncaa_topteams for use in generating leaderboard.

*******************************************************************************/
		
	require_once 'Connection.class.php';
	$connection = new Connection('sportsupdate','sports');

## variables to hold URL variables
$matchup;
$matchupNames;

if ($_GET) {

## capture variables from the URL
	$team1 = mysqli_real_escape_string($connection->con,$_GET['t1']);
	$team2 = mysqli_real_escape_string($connection->con,$_GET['t2']);
	$team1name = mysqli_real_escape_string($connection->con,$_GET['t1name']);
	$team2name = mysqli_real_escape_string($connection->con,$_GET['t2name']);

## order them so teams are in ascending order by team_id so matchup will be counted as the same no matter what order they are selected */
	if ($team1 < $team2 ) {
		$matchup = $team1 . "~" . $team2;
		$matchupNames = $team1name . " vs. " . $team2name;
	} else {
		$matchup = $team2 . "~" . $team1;
		$matchupNames = $team2name . " vs. " . $team1name;
	}

	## insert the matchup [team ids] and matchup_names [team names] into sports.ncaa_topmatchups
	$sql = "INSERT into sports.ncaa_topmatchups (matchup, matchup_names) values ('$matchup', '$matchupNames')";
	$results = mysqli_query($connection->con,$sql);

	## insert team1 and team2 [team id no. and team names] into sports.ncaa_topteams. 
	$sql = "INSERT into sports.ncaa_topteams (team, team_name) values ('$team1', '$team1name')";
	$results = mysqli_query($connection->con,$sql);

	$sql = "INSERT into sports.ncaa_topteams (team, team_name) values ('$team2', '$team2name')";
	$results = mysqli_query($connection->con,$sql);

}

?>

