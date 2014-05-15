/*******************************************************************************
file: cinderella.js
project: Bracket Advisor
date: March 2013
authors: P. Bustamante and Nelson Hsu

overview: loads data from CSVs; builds team data module, team select menus and left stats sorting module; performs button actions and calculates win percentages.

on page load: 
- anonymous function parses URL query strings.
- data is loaded and parsed into JSON from four csvs in the data/ folder (ncaa_percs.csv, ncaa_teams.csv, top_matchups.csv, top_teams.csv).
- teamData[] is used to dyamically populate teams select menus.
- LBmatchData[] and LBteamData[] are used to build the leaderboard
- the sortable stats on the left are build dynamically so stats order and selection from twitter link can be accommodated.

on team selection ("Go" button):
- The ids for the two teams are captured in variables
- buildTeamData() constructs the Team stats modules using teamData[] JSON
- doneSort() captures the order of the sortable stats into sortIDs[].
- calculateWin() does the calculations using calcData[] JSON and then updates the percentage <div>.

*******************************************************************************/

/***********************************************************
script variables
************************************************************/
// vars to hold data
var teamData = [];
var calcData = [];
var LBmatchData = [];
var LBteamData = [];
var dsTeam;
var dsCalc;
var dsLBmatch;
var dsLBteam;
// vars for selected teams and selected stats 
var curteam1='';
var curteam2='';
var sortedIDs = [];


/***********************************************************
 CAPTURE AND PARSE URL VARIABLES:
 	captures query string
 	splits t1, t2 and stats and puts them into params[] array
 	sets curteam1 and curteam2 variables
 	splits params.stats and puts them into sortedIDs array
 	
************************************************************/
var params = function () {
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
    return query_string;
} ();

if (params.t1 && params.t2 ) {
	
	// set the current team variables to teams sent in URL
	curteam1 = parseInt(params.t1);
	curteam2 = parseInt(params.t2);
	
	// split the stats string into an array
	if (params.stats) {
		if ( params.stats.indexOf("|") > -1 ) {
			sortedIDs = params.stats.split("|");
		} else {
			sortedIDs = params.stats.split("-");
		}
	}
} 


$(document).ready(function(){ // begin document.ready block

/***********************************************************
 INITIALIZING ACTIONS:
 load data
 build team data modules and team select menus
 build leftside sortable stats module
 
************************************************************/

	//HIDE TITLE BANNER IF NOT ON BRACKADVISOR.COM
	if (window.location.href.indexOf("embed=no") > -1) {
		$("#titlegraphic").hide();
	}
	$("#titlegraphic").click(function () {
		window.open('http://www.bracketadvisor.com', '_blank');
	});

	$("#closebtn").click(function () {
		$("#embedwell").hide();
	});
	$("#embedwell").hide();

	//holds html of initial sorted stats. called from reset button
	resetText = $("#sortableStats").html();
	
	$('#teamModules').css({ opacity: 0 });
	$('#sharematch').hide();

	// call functions to load data
	loadTeamData();
	loadCalcData();
	loadLBmatchData(); //loadLBteamData() is called from here
	
	// build and check leftside sortable stats
	buildSortStats()
	setCB();

/***********************************************************
 MISO DATASET LOAD/PARSE DATA FUNCTIONS
 	
 	loadTeamData(): loads data/ncaa_team.csv
 					calls populateTeam(), which builds JSON
 					and calls buildTeamData() [outputs stats for select teams]
 	loadCalcData(): loads data/ncaa_percs.csv
 					calls populateCalc(), which builds JSON
 					and calls calculateWin() if there are teams selected
 	loadLBmatchData(): loads data/top_matchups.csv
 					calls populateLBmatchups(), which builds JSON
 					and calls loadLBteamData()
	loadLBteamData(): loads data/top_teams.csv
 					calls populateLBteams(), which builds JSON
 					and calls buildLeaderboard() [outputs leaderboard]
 	
 	[note: populate() functions could be incorporated into loadData() functions to simplify code]

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
	buildSelect();
	if (curteam1 != '') {
		buildTeamData(curteam1,curteam2);
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
	if (curteam1 != '') {
		calculateWin(sortedIDs);	
	}
} 

// LOAD LEADERBOARD MATCHUPS DATA
function loadLBmatchData() {
	dsLBmatch = new Miso.Dataset({
		  url : "data/top_matchups.csv",
		  delimiter : ","	
	});

	dsLBmatch.fetch({ 
	  success : function() {
	    populateLBmatchups();
	  },
	  error : function() {
	  }
	});
}

function populateLBmatchups() {
	var len = dsLBmatch.column("matchup").data.length;
	for (var j=0; j<len; j++) {
		LBmatchData[j] = [ {
								matchup: dsLBmatch.column("matchup").data[j],
								matchup_names: dsLBmatch.column("matchup_names").data[j],
								topm_counts: dsLBmatch.column("topm_counts").data[j]
						    }];
	}
	loadLBteamData();
} 

// LOAD LEADERBOARD TEAMS DATA
function loadLBteamData() {
	dsLBteam = new Miso.Dataset({
		  url : "data/top_teams.csv",
		  delimiter : ","	
	});

	dsLBteam.fetch({ 
	  success : function() {
	    populateLBteams();
	  },
	  error : function() {
	  }
	});
}

function populateLBteams() {
	var len = dsLBteam.column("team_name").data.length;
	for (var j=0; j<len; j++) {
		LBteamData[j] = [ {
								team_name: dsLBteam.column("team_name").data[j],
								topt_counts: dsLBteam.column("topt_counts").data[j]
						    }];
	}
	buildLeaderboard();
} 


/********************************************************************
 BUILD FUNCTIONS:
 	buildSortStats(): 	constructs left-side sortable stats module
 	setCB(): 			checks selected sortable stats
 	buildSelect():		builds two team select menus
 	buildTeamData():	builds stats modules for selected two teams
 	buildLeaderboard():	builds leaderboard
 	
*********************************************************************/

function buildSortStats() {
	
	// array of sortableStats titles
	var statNames = {'a1':'Seed', 'a2':'RPI','a3':'Win percentage','a4':'Scoring margin','a5':'Rebound margin','a6':'Turnovers per game','a7':'Auto / At-large','a8':'Conference'};
	
	// compares sortedIDs[] to full list of stats and adds whatever is missing to create statsList[] -- necessary to accommodate resorted stats list in a twitter feed query string
	var fullStats = ['a1', 'a2', 'a3', 'a4','a5', 'a6', 'a7', 'a8'];
	var exStats = new Array();
	exStats = jQuery.grep(fullStats,function (item) {
    	return jQuery.inArray(item, sortedIDs) < 0; // called sortedIDs array
	});	
	var statsList = sortedIDs.concat(exStats);

	//Empty out existing html
	$('#sortableStats').html('');
	
	// loop through, build, and append sortable stats to #sortableStats <div>
	var len = statsList.length;
	for (var i=0; i<len; i++) {
		var statNameID = statsList[i];
		$('#sortableStats').append('<div id="'+statsList[i]+'" class="dragger"><input type="checkbox" id="'+statsList[i]+'" class="statsCheck" onchange="cbChanged(this,1);"><p>'+eval("statNames." + statNameID) + '</p></div>')
	}
}
	
function setCB() {
	// if sortIDs is empty (nothing in url) then use default settings
	if (sortedIDs.length == 0) {
		sortedIDs = ["a1", "a2", "a3", "a4"];
	}
	var len = sortedIDs.length;
	for (var i=0; i<len; i++) {
		// add check to selected stats
		$("#sortableStats #" + sortedIDs[i]).attr("checked","checked");
	}
}

function buildSelect() {
	// loop through teamData[] and dynamically build select menu
	for (var i=1; i<teamData.length; i++) {
		// build first select menu
		if (curteam1 == teamData[i][0].team_id) {
			$("#dd1").append('<option value="' + teamData[i][0].team_id + '" selected>' + teamData[i][0].team + '  (' + teamData[i][0].seed + ')</option>');
		} else {
			$("#dd1").append('<option value="' + teamData[i][0].team_id + '">' + teamData[i][0].team + '  (' + teamData[i][0].seed + ')</option>');
		}
		// build second select menu
		if (curteam2 == teamData[i][0].team_id) {
			$("#dd2").append('<option value="' + teamData[i][0].team_id + '" selected >' + teamData[i][0].team + '  (' + teamData[i][0].seed + ')</option>');
		} else {
			$("#dd2").append('<option value="' + teamData[i][0].team_id + '">' + teamData[i][0].team + '  (' + teamData[i][0].seed + ')</option>');
		}
	
	}
}

function buildTeamData(team1,team2) {
	
	//TEAM 1
	$(".team1 .teamName").html(teamData[team1][0].team_med);
	$(".team1 .conference").text(teamData[team1][0].conf);
	$(".team1 .record").text(teamData[team1][0].record);
	$(".team1 .teamLogo").attr({src: 'logos/' + teamData[team1][0].logo_name});	
	$(".team1 .seed").text(teamData[team1][0].seed);
	$(".team1 .rpi").text(teamData[team1][0].rpi);
	$(".team1 .winperc").text(teamData[team1][0].win_perc + "%");
	
	if (teamData[team1][0].scr_mar > 0) {
		$(".team1 .scr_mar").text('+' + teamData[team1][0].scr_mar);
	} else {
		$(".team1 .scr_mar").text(teamData[team1][0].scr_mar);
	}
	
	if (teamData[team1][0].reb_mar > 0) {
		$(".team1 .reb_mar").text('+' + teamData[team1][0].reb_mar);
	} else {
		$(".team1 .reb_mar").text(teamData[team1][0].reb_mar);
	}
	
	$(".team1 .turnover").text(teamData[team1][0].turnover);
	$(".team1 .berth").html("<b>" + teamData[team1][0].berth + " berth</b>");
	
	//TEAM 2
	$(".team2 .teamName").html(teamData[team2][0].team_med);
	$(".team2 .conference").text(teamData[team2][0].conf);
	$(".team2 .record").text(teamData[team2][0].record);
	$(".team2 .teamLogo").attr({src: 'logos/' + teamData[team2][0].logo_name});	
	$(".team2 .seed").text(teamData[team2][0].seed);
	$(".team2 .rpi").text(teamData[team2][0].rpi);
	$(".team2 .winperc").text(teamData[team2][0].win_perc + "%");
	
	if (teamData[team2][0].scr_mar > 0) {
		$(".team2 .scr_mar").text('+' + teamData[team2][0].scr_mar);
	} else {
		$(".team2 .scr_mar").text(teamData[team2][0].scr_mar);
	}
	
	if (teamData[team2][0].reb_mar > 0) {
		$(".team2 .reb_mar").text('+' + teamData[team2][0].reb_mar);
	} else {
		$(".team2 .reb_mar").text(teamData[team2][0].reb_mar);
	}
	
	$(".team2 .turnover").text(teamData[team2][0].turnover);
	$(".team2 .berth").html("<b>" + teamData[team2][0].berth + " berth</b>");
	
	//doneSort();
	$('#teamModules').css({ opacity: 1 });
	$('#sharematch').show();

}

function buildLeaderboard() {
	// top matchups
	for (var i=0; i<5; i++) {
		var LBorder = i+1;
		// get team ids for share url vars
		var t_ids = LBmatchData[i][0].matchup;
		var t_idsplit = t_ids.split("~");
		var tid1 = t_idsplit[0];
		var tid2 = t_idsplit[1];
		
		$('#LBtopmatchups').append('<li><a target="_parent" href="http://www.bracketadvisor.com/?t1='+tid1+'&amp;t2='+tid2+'">'+ LBorder +'. '+ LBmatchData[i][0].matchup_names + '</a></li>');
	}
	// top teams -- first column
	for (var i=0; i<5; i++) {
		var LBorder = i+1;
		
		$('#LBtopteams1').append('<li>'+ LBorder +'. '+ LBteamData[i][0].team_name + '</li>');
	}
	// top teams -- second column	
	for (var i=5; i<10; i++) {
		var LBorder = i+1;
		
		$('#LBtopteams2').append('<li>'+ LBorder +'. '+ LBteamData[i][0].team_name + '</li>');
	}
}

/***********************************************************
 BUTTON ACTIONS:
 	#gobtn: 	records selected teams and records selected teams in DB
 				calls buildTeamData() and doneSort() which calls calculateWin()
 	#selectAll: checks all options in the sortable data module
 	#clearAll:	unchecks all options in the sortable data module
 	#reset:		resets checkboxes to initial settings
 	#sharematch: preps and loads url to tweet matchup and sorted stats order
 			
************************************************************/
	$('#gobtn').on('click', function() {

			//CAPTURE SELECTED MENU ITEMS
			curteam1 = $("#dd1 option:selected").attr("value");
			curteam2 = $("#dd2 option:selected").attr("value");
						
			if (curteam1 == curteam2 || curteam1 == "" || curteam2 == "" ) {
				alert("You can't fool the advisor. Pick a real match-up.");
			} else {
				
				//get team medium names to record in database
				team1name = teamData[curteam1][0].team_med;
				team2name = teamData[curteam2][0].team_med;
				team1name = team1name.replace(/ /g,"%20");
				team2name = team2name.replace(/ /g,"%20");

				buildTeamData(curteam1,curteam2);
				doneSort();
				
				$('#teamModules').css({ opacity: 1 });

				//JUMP TO ANCHOR LINK
				location.hash = "#moduleanchor";
				
				//process selections
				$('#holding').load('incl/leaderboard.php?t1='+curteam1+'&t2='+curteam2+'&t1name='+team1name+'&t2name='+team2name, function() {
					$('#holding').hide();
			    });
			}

	});
	
	$('#selectAll').click(function () {
    	$("#sortableStats .statsCheck").prop('checked', true);
    		doneSort();
	});

	$('#clearAll').click(function () {
    	$("#sortableStats .statsCheck").prop('checked', false);
    		doneSort();
	});

	$('#reset').click(function () {
    	$("#sortableStats").html(resetText);
    		
    		sortedIDs = ["a1", "a2", "a3", "a4"];
     		setCB();
   			if (curteam1 != '') {
   				doneSort()
        	}
	});

	$('#sharematch').on('click', function() {

		var shareStats = sortedIDs.join("%2D");
		var url = "https://twitter.com/intent/tweet?url=http%3A%2f%2fwww.bracketadvisor.com%2f%3ft1%3d" + curteam1 + "%26t2%3d" + curteam2 + "%26stats%3D" + shareStats + "&text=See+my+%40BracketAdvisor+pick+for+" + teamData[curteam1][0].twitter + "+vs.+" + teamData[curteam2][0].twitter;
		window.open(url);		
	});

}); // end document.ready block


/********************************************************************
 SORTING, CHECKING, CALCULATING STUFF
 	doneSort(): set off when stat is sorted or checked/unchecked 
 				and when teams are selected
 				captures selected stats in order
 				calls calculateWin() to set team win percentages
 	cbChanged(): set off when stat is checked or unchecked
 				 calls doneSort()
 	showEmbedWell(): shows #embedwell div
 	
 	calculateWin(): called from doneSort()
 					calculates win percentage using selected stats [sortIDs]
 					inserts results into .numBox for each team displayed	
 				 
*********************************************************************/
$(function() {
    $( "#sortableStats" ).sortable({
        placeholder: "statsPlaceHolder",
        stop: doneSort
    });
    $( "#sortableStats" ).disableSelection();

});

function doneSort() {
    sortedIDs = [];

    $("#sortableStats input:checked").each(function(i) {
    	sortedIDs[i] = $(this).attr('id');
    });
    
    // if user starts playing with stats before teams have been selected
	if (curteam1 != "" && curteam2 != "" ) {
		calculateWin(sortedIDs);
	}
}

function cbChanged(cb, which) {
	doneSort();
}

function showEmbedWell() {
	$("#embedwell").show();
}

function calculateWin(statIDs) {
	// if no stats selected get rid of percentages
	if (statIDs.length < 1 ) {
			$(".team1 .numBox").text("--");
			$(".team2 .numBox").text("--");	
	} else {
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
				$(".team1 .numBox").text("50%")
				$(".team2 .numBox").text("50%")
			
			} else if ((temp2perc == 0) && (temp1perc != 0)) {
				$(".team1 .numBox").text("99%")
				$(".team2 .numBox").text("1%")

			} else if ((temp1perc == 0) && (temp2perc != 0)) {
				$(".team1 .numBox").text("1%")
				$(".team2 .numBox").text("99%")

			} else {
				// calculate each team's win percentage
				team1winperc = Math.round((100 * temp1perc) / (temp1perc + temp2perc));
				team2winperc = Math.round((100 * temp2perc) / (temp1perc + temp2perc));
				
				// drop final percent into html
				$(".team1 .numBox").text(team1winperc + "%")
				$(".team2 .numBox").text(team2winperc + "%")
			
			}
	}
}

