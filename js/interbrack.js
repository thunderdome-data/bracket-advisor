/*******************************************************************************
file: interbrack.js
project: Bracket Advisor 2014
date: March 2014
authors: P. Bustamante

overview: captures two teams from div data- atributes, loads data from CSVs; calculates win percentages; writes results to interactive bracket modal.

*******************************************************************************/

/***********************************************************
script variables
************************************************************/
// vars to hold data
var teamData = [];
var calcData = [];
var dsTeam;
var dsCalc;
// vars for selected teams and selected stats 
var curteam1='';
var curteam2='';
var statIDs = ['a1','a2','a3','a4'];


$(document).ready(function(){ // begin document.ready block

/***********************************************************
 INITIALIZING ACTIONS: load data
************************************************************/

	// call functions to load data
	loadTeamData();
	loadCalcData();
	
/***********************************************************
 MISO DATASET LOAD/PARSE DATA FUNCTIONS
 	
 	loadTeamData(): loads data/ncaa_team.csv
 					calls populateTeam(), which builds JSON
 	loadCalcData(): loads data/ncaa_percs.csv
 					calls populateCalc(), which builds JSON
  
************************************************************/

// LOAD NCAA_TEAM.CSV DATA
function loadTeamData() {
	dsTeam = new Miso.Dataset({
		  url : "data/ncaa_teams.csv",
		  delimiter : ","	
	});

	dsTeam.fetch({ 
	  success : function() {
	  
	  	  this.sort(function(rowA, rowB) {
			if (rowA.team > rowB.team) { 
			  return -1; 
			}
			if (rowA.team < rowB.team) { 
			  return 1;  
			}
			return 0;
		  });
	    populateTeam();
	  },
	  error : function() {
	  }
	});
}

function populateTeam() {
	var len = dsTeam.column("team").data.length;
	for (var j=0; j<len; j++) {
		var counter = dsTeam.column("team_id").data[j];
		teamData[counter] = [ {
					team_id: dsTeam.column("team_id").data[j],
					year: dsTeam.column("year").data[j],
					seed: dsTeam.column("seed").data[j],
					team: dsTeam.column("team").data[j],
					team_med: dsTeam.column("team_med").data[j],
					team_short: dsTeam.column("team_short").data[j],
					logo_url: dsTeam.column("logo_url").data[j],
					logo_name: dsTeam.column("logo_name").data[j],
					conf: dsTeam.column("conf").data[j],
					win_perc: dsTeam.column("win_percent").data[j],
					record: dsTeam.column("record").data[j],
					berth: dsTeam.column("berth").data[j],
					rpi: dsTeam.column("rpi").data[j],
					reb_mar: dsTeam.column("reb_mar").data[j],
					scr_mar: dsTeam.column("scr_mar").data[j],
					turnover: dsTeam.column("turnover").data[j],
					twitter: dsTeam.column("twitter").data[j]
				}];
	}
} 

// LOAD NCAA_PERCS.CSV DATA
function loadCalcData() {
	dsCalc = new Miso.Dataset({
		  url : "data/ncaa_percs.csv",
		  delimiter : ","	
	});

	dsCalc.fetch({ 
	  success : function() {
	    populateCalc();
	  },
	  error : function() {
	  }
	});
}

function populateCalc() {
	var len = dsCalc.column("team_id").data.length;
	for (var j=0; j<len; j++) {
		var counter = dsCalc.column("team_id").data[j];
		calcData[counter] = [ {
			team_id: dsCalc.column("team_id").data[j],
			team: dsCalc.column("team").data[j],
			a1: dsCalc.column("seed").data[j],
			a8: dsCalc.column("conf").data[j],
			a3: dsCalc.column("win_percent").data[j],
			a7: dsCalc.column("berth").data[j],
			a2: dsCalc.column("rpi").data[j],
			a5: dsCalc.column("reb_mar").data[j],
			a4: dsCalc.column("scr_mar").data[j],
			a6: dsCalc.column("turnover").data[j]
		}];
	}
} 

/***********************************************************
 BUTTON ACTION: calculates percentages
************************************************************/
	
	$('.btn-calculate').click(function(){
		curteam1 = $(this).attr('data-t1');
		curteam2 = $(this).attr('data-t2');
		
		calculateWin(statIDs);	
	});

/***************************************************************************
  CALCULATE FUNCTION
  
 	calculateWin(): calculates win percentage using selected stats [statIDs]
 					inserts results into bracket modal	
****************************************************************************/

function calculateWin(statIDs) {
	var statIDsLen = statIDs.length;

	// do calculations for each matchup
		var statsWeightedTeam1 = 0;
		var statsWeightedTeam2 = 0;
		var statsDivisor = 0;
		var weight = statIDsLen;
		
		// calculate weighted stats and sum the weights
		for (var j=0; j<statIDsLen; j++) {
			statsWeightedTeam1 += parseInt(eval("calcData[curteam1][0]." + statIDs[j])) * weight;			
			statsWeightedTeam2 += parseInt(eval("calcData[curteam2][0]." + statIDs[j])) * weight;
			statsDivisor += weight;
			weight--;
		}

		// calculate team1 and team2 percentages
		temp1perc = statsWeightedTeam1 / statsDivisor;
		temp2perc = statsWeightedTeam2 / statsDivisor;
		
		// make sure percent is never 0%-0% or 100%
		if ((temp1perc == 0) && (temp2perc == 0)) {
			$("#teamPerc1").text("50%");
			$("#teamPerc2").text("50%");
		
		} else if ((temp2perc == 0) && (temp1perc != 0)) {
			$("#teamPerc1").text("99%");
			$("#teamPerc2").text("1%");

		} else if ((temp1perc == 0) && (temp2perc != 0)) {
			$("#teamPerc1").text("1%");
			$("#teamPerc2").text("99%");

		} else {
			// calculate each team's win percentage
			team1winperc = Math.round((100 * temp1perc) / (temp1perc + temp2perc));
			team2winperc = Math.round((100 * temp2perc) / (temp1perc + temp2perc));
			
			// drop final data into modal
			// win percentage
			$("#teamPerc1").text(team1winperc + "%");
			$("#teamPerc2").text(team2winperc + "%");
			// team name
			$("#teamName1").html(teamData[curteam1][0].team_med);
			$("#teamName2").html(teamData[curteam2][0].team_med);
			// BA url
			$("#matchupURL").text("http://www.bracketadvisor.com/?t1=" + curteam1 + "&t2=" + curteam2 + "&stats=a1-a2-a3-a4");		
		}
}

}); // end document.ready block


