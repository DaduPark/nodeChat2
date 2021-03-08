

$(document).ready(function(){

	var ua = navigator.userAgent;
	var iOS = /iPad|iPhone|iPod/.test(ua);

	 if(iOS){
		 document.getElementById("cssLink").setAttribute("href", "../assets/css/style_ios.css");
	 };
		      
   	 $(window).scroll(function(){ 
		if ($(this).scrollTop() > 100) { 
			$('#top').fadeIn(); 
		} else { 
			$('#top').fadeOut(); 
		} 
	}); 
	$('#top').click(function(){ 
		$("html, body").animate({ scrollTop: 0 }, 90); 
		return false; 
	}); 
});