/*******************************************************************************
file: interbrack.js
project: Bracket Advisor
date: February 2014
authors: P. Bustamante


*******************************************************************************/



$(document).ready(function(){ // begin document.ready block

	//document.write("hello javascript");
	
	$('#holding').load('js/interbrack.js', function() {
			console.log("it worked");
	});

/*
  $.ajax({
        url: "interbrack.php",
        type: "post",
        //data: values,
        success: function(data){
        	console.log(data);
        },
        error:function(){
            alert("failure");
            //$("#result").html('There is an error submitting');
        }
    });
*/	

	$('#gobtn').on('click', function() {
				$('#holding').load('incl/leaderboard.php?t1='+curteam1+'&t2='+curteam2+'&t1name='+team1name+'&t2name='+team2name, function() {
					$('#holding').hide();
			    });
	});
	


}); // end document.ready block


