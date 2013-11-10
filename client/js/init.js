Template.login.rendered =  function(){

var modalTitle = $('.modalw').find('h3').text()

    //open modal
	$('#toggle-modalw').on('click', function(e) {
		$('.modalw').addClass('active');
		$('.modalw-inner').mtabs('show', 0);
		e.preventDefault();
	});

    //close modal
	$('.close-modalw').on('click', function( e ) {
		$('.modalw').removeClass('active');
		$(this).closest('.modalw-content').find('h3').text(modalTitle);
		e.preventDefault();
	});

	$('.top, .logo').on('click', function(){
	   $('html, body').animate({
			scrollTop: "0px"
	   }, 800);
	});

	$(".modalw-inner").mtabs();

	$('.forgotBtn').on('click', function(e) {
		$('.modalw-inner').mtabs('show', 1);
		$(this).closest('.modalw-content').find('h3').text('Request password');
		e.preventDefault();
	});

	$('.loginBtn').on('click', function(e) {
		$(this).closest('.modalw-content').find('h3').text(modalTitle);
		$('.modalw-inner').mtabs('show', 0);
		e.preventDefault();
	});

	$('.smalltext').on('click', function(e) {
		$('.modalw').addClass('active');
		$('.modalw-content').find('h3').text('Ekkli Maps - Signup');
		$('.modalw-inner').mtabs('show', 2);
		e.preventDefault();
	});


     //init gallery
     $.zoom();

    /*
     $('.header .center').append('<div class="size"></div>');
     function alertWidth() {

         $('.size').text($(window).outerWidth());

     }
     alertWidth();
     $(window).resize(function () {
         alertWidth();
     });
     */


}