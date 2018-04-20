/*global $, analytics, ga, mixpanel, vc4g*/
$.extend({
    getQueryParameters: function(str) {
        return (str || document.location.search).replace(/(^\?)/, '').split("&").map(function(n) {
            return n = n.split("="), this[n[0]] = n[1], this;
        }.bind({}))[0];
    },
    parseName: function(name) {
        var firstName = name;
        if (firstName.indexOf(' ') >= 0) {
            firstName = name.split(' ').slice(0, -1).join(' ');
        }
        var lastName = name.replace(firstName + ' ', '');
        return 'first_name=' + firstName + '&last_name=' + lastName;
    },
    parseNameInObj: function(obj) {
        if (typeof(obj.name) != 'undefined') {
            var tempObj = $.getQueryParameters($.parseName(obj.name));
            obj.first_name = tempObj.first_name;
            obj.last_name = tempObj.last_name;
        }
    }
});

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        if (typeof(analytics) != 'undefined') {
            analytics.track('Clicked Home Nav', {
                menu_item: $anchor.html(),
                nav_shrink: $('.navbar-fixed-top').hasClass('navbar-shrink')
            });
        }
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

$('#aboutTerms').on('hidden.bs.collapse', function() {
    $(this).find('a.collapsed div:first-child').html('<i class="fa fa-arrow-circle-o-right fa-fw"></i>');
});
$('#aboutTerms').on('shown.bs.collapse', function() {
    $(this).find('a').not('.collapsed').find('div:first-child').html('<i class="fa fa-arrow-circle-o-down fa-fw"></i>');
});

$(document).ready(function() {
    //Header animate
    headerAnimate();
    $(window).scroll(function() {
        headerAnimate();
    });
    $(window).resize(function() {
        headerAnimate();
    });

    //What we buy
    $('#calcGoldForm,#calcSilverForm').focusin(function(){
        $(this).find('#success').html('');
    });
    $('.calculator a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        $(e.target).closest('.bar-prd').find('a').removeClass('active');
        $(e.target).addClass('active');
    });
    $('.calculator label.btn').click(function(){
        var $form = $(this).closest('form');
        var data = $.getQueryParameters($form.serialize());
        var mixProperties = data;
        if (data.weight > 0) {
            data.action = 'ajax_calculate';
            $.ajax({
                url: vc4g.ajax_url,
                type: "POST",
                data: data,
                dataType: 'json',
                success: function(response) {
                    if (typeof(ga) != 'undefined') {
                        ga('send', 'event', data.type + ' calculator', 'estimate price', 'success');
                    }
                    mixProperties.result = 'success';
                    mixProperties.price = response.price;
                    $form.find('#calculatedPrice').val('$'+response.price);
                },
                error: function(response) {
                    if (typeof(ga) != 'undefined') {
                        ga('send', 'event', data.type + ' calculator', 'estimate price', 'failure');
                    }
                    mixProperties.result = 'failure';
                    mixProperties.message = 'Not valid output';
                    $form.find('#success').html('So sorry! We are unable to progress your request at this time, please try again later or call!');
                    // alert('So sorry! We are unable to progress your request at this time, please try again later or call!');
                }
            });
        }
        else {
            if (typeof(ga) != 'undefined') {
                ga('send', 'event', 'gold calculator', 'estimate price', 'failure');
            }
            mixProperties.result = 'failure';
            mixProperties.message = 'Not valid weight value';
            $form.find('#success').html('Please all enter valid values.');
            // alert('Please all enter valid values.');
        }
        if (typeof(mixpanel) != 'undefined') {
            mixpanel.track("Estimate Price", mixProperties);
        }
    });
});

var timer = 0;
$(document).ajaxStart(function (e) {
    timer = setTimeout(function () { $('body .btn').css('cursor', 'progress'); }, 50);
});
$(document).ajaxStop(function () {
    $('body .btn').css('cursor', 'pointer');
    clearTimeout(timer);
});

function headerAnimate() {
    var thresHold = $('header').outerHeight();
    var top = $(window).scrollTop();
    if (top < thresHold) {
        $('.navbar-default').css('top', thresHold - top).removeClass('navbar-shrink');
    }
    else {
        $('.navbar-default').css('top', 0).addClass('navbar-shrink');
    }
}