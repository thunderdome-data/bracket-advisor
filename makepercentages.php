<!DOCTYPE HTML>
<html>
<head>
	<title>Hello cinderella!</title>
</head>
<body>

<h1>Hello cinderella!</h1>

<?php

/*******************************************************************************
file: hello.php [note: should be renamed in future projects]
project: Bracket Advisor
date: March 2013
authors: P. Bustamante and B. Bonett

overview: generates the stats used to calculate the percentage win for the teams selected. The data is drawn from sports.ncaa_data (historical data) and sports.ncaa_teams (current team stats), the calculations are performed and then the percentages are inserted into sports.ncaa_percentages. sports.ncaa_percentages and sports.ncaa_teams are exported as .csv files (data/ncaa_percs.csv and data/ncaa_teams).
[note: this is done in MAMP on p. bustamante's computer. Future scripts will be re-written to use mysqli connects]

*******************************************************************************/

	##  file with DB connect constants
	## require_once('conf/dbconfig.php');
	
	## get all the data from the sports.ncaa_teams table. each field will be used in the following loop to calculate each stat.
	$sql=mysql_query("select * from ncaa_teams where seed != '0'");
	while($dataTeams[]=mysql_fetch_array($sql));

/*******************************************************************************
For each team, calculates percentage win for each of eight stats. at the end of each loop, a row of stats are are inserted into sports.ncaa_percentages for each team. 

within each calculation:
- capture current team's data for the stat in a variable
- select summed gametotal and summed wintotal from sports.ncaa_data where historical data matches the current team's data for that stat.
- divide wintotal / gametotal and multiply by 100 to get the percentage.

 
*******************************************************************************/

	for ($i = 0; $i < count($dataTeams)-1; $i++) { // BEGIN LOOP
				
		// SEED CALCULATION
		$dataSeed = []; 
		$seed = $dataTeams[$i]['seed']; // get seed for current team
		
		$sql=mysql_query("select sum(gametotal) as gametotal, sum(wintotal) as wintotal from ncaa_data where seed = '$seed'");
		while($dataSeed[]=mysql_fetch_array($sql));
			
		$seedTally = ($dataSeed[0]['wintotal'] / $dataSeed[0]['gametotal']) * 100;
		
		echo '0, ' . $dataTeams[$i]['team'] . ", " .$seedTally. ", ";



		// CONFERENCE CALCULATION
		$dataConf = [];
		$conf = $dataTeams[$i]['conf']; // get conference for current team
		
		$sql=mysql_query("select sum(gametotal) as gametotal, sum(wintotal) as wintotal from ncaa_data where conf = '$conf'");
		while($dataConf[]=mysql_fetch_array($sql));
		
		$confTally = ($dataConf[0]['wintotal'] / $dataConf[0]['gametotal']) * 100;
		
		echo $confTally . ", ";
		
		
		
		// WIN PERCENTAGE CALCULATION
		$datawinPercent = [];
		$winPercent = $dataTeams[$i]['win_percent']; // get win percentage for current team
		$win_high = $winPercent+2;
		$win_low = $winPercent-2;

		
		$sql=mysql_query("select sum(gametotal) as gametotal, sum(wintotal) as wintotal from ncaa_data where win_percent BETWEEN '$win_low' AND '$win_high'");
		while($datawinPercent[]=mysql_fetch_array($sql));
		
		//echo "wintotal: " . $datawinPercent[0]['wintotal'];
		//echo "gametotal: " . $datawinPercent[0]['gametotal'];
		
		$winPercentTally = ($datawinPercent[0]['wintotal'] / $datawinPercent[0]['gametotal']) * 100;
		
		echo $winPercentTally . ", ";
		
		
		
		// BERTH CALCULATION
		$dataBerth = [];
		$berth = $dataTeams[$i]['berth']; // get berth for current team
		
		$sql=mysql_query("select sum(gametotal) as gametotal, sum(wintotal) as wintotal from ncaa_data where berth = '$berth'");
		while($dataBerth[]=mysql_fetch_array($sql));
		
		$berthTally = ($dataBerth[0]['wintotal'] / $dataBerth[0]['gametotal']) * 100;
		
		echo $berthTally . ", ";
		
		
		
		// RPI CALCULATION
		$dataRpi = [];
		$rpi = $dataTeams[$i]['rpi'];
		
		$sql=mysql_query("select sum(gametotal) as gametotal, sum(wintotal) as wintotal from ncaa_data where rpi = '$rpi'");
		while($dataRpi[]=mysql_fetch_array($sql));
		
		$rpiTally = ($dataRpi[0]['wintotal'] / $dataRpi[0]['gametotal']) * 100;
		
		echo $rpiTally . ", ";
		
		
		
		// REBOUNDS CALCULATION
		$dataRebMar = [];
		$rebMar = $dataTeams[$i]['reb_mar']; // get rebound margin for current team
		$reb_high = $rebMar+.5;
		$reb_low = $rebMar-.5;
		
		$sql=mysql_query("select sum(gametotal) as gametotal, sum(wintotal) as wintotal from ncaa_data where reb_mar BETWEEN '$reb_low' AND '$reb_high'");
		while($dataRebMar[]=mysql_fetch_array($sql));
		
		$rebMarTally = ($dataRebMar[0]['wintotal'] / $dataRebMar[0]['gametotal']) * 100;
		
		echo $rebMarTally . ", ";
		
		
		
		// SCORING CALCULATION
		$dataScrMar = [];
		$scrMar = $dataTeams[$i]['scr_mar']; // get scoring margin for current team
		$scr_high = $scrMar+.5;
		$scr_low = $scrMar-.5;

		
		$sql=mysql_query("select sum(gametotal) as gametotal, sum(wintotal) as wintotal from ncaa_data where scr_mar BETWEEN '$scr_low' AND '$scr_high'");
		while($dataScrMar[]=mysql_fetch_array($sql));
		
		//echo $dataScrMar[0]['wintotal'];
		
		$scrMarTally = ($dataScrMar[0]['wintotal'] / $dataScrMar[0]['gametotal']) * 100;
		
		echo $scrMarTally . ", ";
		
		
		
		// TURNOVERS CALCULATION
		$dataTurnover = [];
		$turnover = $dataTeams[$i]['turnover']; // get turnovers for current team
		$turn_high = $turnover+.5;
		$turn_low = $turnover-.5;
		
		$sql=mysql_query("select sum(gametotal) as gametotal, sum(wintotal) as wintotal from ncaa_data where turnover BETWEEN '$turn_low' AND '$turn_high'");
		while($dataTurnover[]=mysql_fetch_array($sql));
		
		$turnoverTally = ($dataTurnover[0]['wintotal'] / $dataTurnover[0]['gametotal']) * 100;
		
		echo $turnoverTally . ", ";
		
		$totalTally = ($seedTally + $confTally + $winPercentTally + $berthTally + $rpiTally + $rebMarTally + $scrMarTally + $turnoverTally)/8;
		
		echo $totalTally . "<br />";


## put current team's id no. and name into variables
		
		$team_id = $dataTeams[$i]['team_id'];
		$teamname = $dataTeams[$i]['team'];		

## insert team id no., team name, and percentage win stats into sports.ncaa_percentages
		$sql=mysql_query("INSERT into sports.ncaa_percentages (team_id,team,seed,conf,win_percent,berth,rpi,reb_mar,scr_mar,turnover) values ('$team_id','$teamname','$seedTally','$confTally','$winPercentTally','$berthTally','$rpiTally','$rebMarTally','$scrMarTally','$turnoverTally')");

	} // END TEAM LOOP

?>


</body>
</html>
