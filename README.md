Bracket Advisor
==========

March Madness Predictor | General Predictor App

/*******************************************************************************

project name: Bracket Advisor
url: http://www.bracketadvisor.com
pub dates: March 2013 and March 2014
authors: Peggy Bustamante, Nelson Hsu, Bobbie Bonett

overview:
	Calculates the win probability for two teams selected using zero to eight stats selected and sorted by the user.
	
	This iteration is for NCAA tournament. The format could be used for any bracketed sports playoff.
	
	The flow of code:
	On load, data is loaded from four csv files, the lefthand sortable stats are built dynamically (in specified order if from the URL), the two select menus of teams are dynamically generated (from ncaa_teams.csv) and the leaderboard is generated (from top_matchups.csv and top_teams.csv)
	Users can sort and select/deselect stats to be used in the calculation, and  select two teams from the dropdown menu. Once they hit the "Go" button, the selection is recorded in a DB table, the teams' info modules are populated and the percentage with is calculated. Similarly, whenever a stat is selected, deselected or sorted, the percent win is recalculated.
	There is also a button to post your matchup (with stat selection) on Twitter.

Relevant code files:
	app.html
		holds html
	js/cinderella.js
		overview: loads data from CSVs; builds team data module, team select menus and left stats sorting module; performs button actions and calculates win percentages.
	incl/leaderboard.php
		overview: captures user's team selections in tables sports.ncaa_topmatchups and sports.ncaa_topteams for use in generating leaderboard.
	csvoutput.php
		overview: generates two csv files (data/top_matchups.csv and data/top_teams.csv) at 15-minute intervals from production database for use in the leaderboard. The csvs are generated on beta and then rsynced to production in a cron job.
	makepercentages.php
		overview: generates the stats used to calculate the percentage win for the teams selected. The data is drawn from sports.ncaa_data (historical data) and sports.ncaa_teams (current team stats), the calculations are performed and then the percentages are inserted into sports.ncaa_percentages. sports.ncaa_percentages and sports.ncaa_teams are exported as .csv files (data/ncaa_percs.csv and data/ncaa_teams).
		[note: this is done in MAMP on p. bustamante's computer.]
	
	/*** data files ***/
	data/ncaa_percs.csv   == used in win percent calculations
	data/ncaa_teams.csv   == hold's teams' info, names and stats
	data/top_matchups.csv   == for leaderboard, has top 5 matchups selected
	data/top_teams.csv   == for leaderboard, has top 10 teams selected


*******************************************************************************/

/******************************************************************************
	FEATURES TO ADD IN NEXT ITERATION:
	
	* Add click event tracking code from Google Analytics
		add google analytics code to button:
		<button id="new-name-button" type="button" onclick="_gaq.push(['_trackEvent', 'Thundername', 'Click button', 'Pick new TD name']);">Go!</button>
	
	* Link top teams list to twitter accounts:
		Link Leaderboard Top Teams to their Twitter accounts, pop up in new window.
	
	* Should we flag eliminated teams in dropdowns:
		As teams get eliminated, flag them with an image or with bgcolor in the dropdown menus.
	
	* Add a custom URL share button in addition to the twitter share.
		A button that would generate the share button URL without dependency on Twitter. just the URL: http://www.bracketadvisor.com/?t1=3&t2=5&stats=a6-a2-a3-a4

*******************************************************************************/

License
----------

This code is available under the MIT license. For more information, please see the LICENSE.txt file in this repo.
