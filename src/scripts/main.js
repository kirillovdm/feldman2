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




TweenMax.staggerTo('#Fill-5', 3, {drawSVG:0, delay:1}, 0.1);

// var tl = new TimelineMax({repeat:-1, repeatDelay:0.3, yoyo: true});
// // MorphSVGPlugin.convertToPath('#vk-icon, #insta-icon, #fb-icon')
// tl.to('#vk-icon', 1.3, {morphSVG:'#fb-icon'});




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
    speed: 1000,
    pager: false
  });
  
  setTimeout(function(){
    $("div:contains('Thumbnail Slider trial version')").contents().filter(function () {
        return (this.nodeType == 3 && $.trim(this.nodeValue) == 'Thumbnail Slider trial version');
    }).remove();
    $("div:contains('Ninja Slider trial version')").contents().filter(function () {
        return (this.nodeType == 3 && $.trim(this.nodeValue) == 'Ninja Slider trial version');
    }).remove();

        // $('.fotorama__arr').clone().appendTo('.fotorama__wrap');
        // $('.fotorama__stage  .fotorama__arr').remove();
  }, 300);
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

