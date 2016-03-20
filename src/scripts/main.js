$(window).on('load', function () {
    var $preloader = $('.page-preloader'),
        $spinner   = $preloader.find('.preloader-itself');
    $spinner.fadeOut();
    $preloader.delay(350).fadeOut('slow');
});


(function ($) {
    "use strict";

    $('.selectize').selectize({
        sortField: 'text'
    });

    $('.selectize-tag').selectize({
        plugins: ['remove_button'],
        delimiter: ',',
        persist: false,
        create: function (input) {
            return {
                value: input,
                text: input
            };
        }
    });

    $('.carousel').carousel({
      interval: 3000
    })


    
})(window.jQuery);

var wow = new WOW();
wow.init();

$(document).ready(function(){
  $('.show-slider').bxSlider({
    minSlides: 1,
    maxSlides: 1,
    moveSlides: 1,
    slideMargin: 0,
    auto: true,
    pager: false
  });

});

function checkOffset(){
    var screenHeight = window.innerHeight;
    var windOffset = window.pageYOffset;
    var $el = $('.spy-el')
    var elOffset = $el.offset().top;

    if(windOffset > elOffset - screenHeight/1.5){
        $('.spy-el').addClass('show-el');
    }
    requestAnimationFrame(checkOffset);
}
requestAnimationFrame(checkOffset);
// $(window).on('scroll', function(){
//     }
// });