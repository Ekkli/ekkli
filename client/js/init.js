Template.login.rendered =  function(){

var modalTitle = $('.modal').find('h3').text()


	$('#toggle-modal').on('click', function(e) {
		$('.modal').addClass('active');
		$('.modal-inner').mtabs('show', 0);
		e.preventDefault();
	});


	$('.close-modal').on('click', function( e ) {
		$('.modal').removeClass('active');
		$(this).closest('.modal-content').find('h3').text(modalTitle);
		e.preventDefault();
	});

	$('.top, .logo').on('click', function(){
	   $('html, body').animate({
			scrollTop: "0px"
	   }, 800);
	});

	$(".modal-inner").mtabs();

	$('.forgotBtn').on('click', function(e) {
		$('.modal-inner').mtabs('show', 1);
		$(this).closest('.modal-content').find('h3').text('Request password');
		e.preventDefault();
	});

	$('.loginBtn').on('click', function(e) {
		$(this).closest('.modal-content').find('h3').text(modalTitle);
		$('.modal-inner').mtabs('show', 0);
		e.preventDefault();
	});

	$('.smalltext').on('click', function(e) {
		$('.modal').addClass('active');
		$('.modal-content').find('h3').text('Ekkli Maps - Signup');
		$('.modal-inner').mtabs('show', 2);
		e.preventDefault();
	});

	$('.gallery').magnificPopup({
		delegate: 'a',
		type: 'image',
		closeOnContentClick: false,
		closeBtnInside: false,
		mainClass: 'mfp-with-zoom mfp-img-mobile',
		image: {
		  verticalFit: true
		},
		gallery: {
		  enabled: true
		},
		zoom: {
		  enabled: true,
		  duration: 300, // don't foget to change the duration also in CSS
		  opener: function(element) {
			return element.find('img');
		  }
		}
	});
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