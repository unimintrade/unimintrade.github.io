/*global $*/
/*global vc4g*/
/*global analytics*/
$(function() {
    function popDownload($form, response) {
        if (typeof(response.download_url) != 'undefined') {
            window.location.href = response.download_url;
        }
        else {
            window.location.href = $form.find('#thanks').val();
        }
    }

    $("input,textarea").not('[type="submit"]').jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            var errorMessage = 'Your request is temporarily unable to be processed. Please try again later.';
            // get values from FORM
            // var actionName  = $form.find('input[name="action"]').val();
            var leadData = $.getQueryParameters($form.serialize());
            $.parseNameInObj(leadData);
            $.ajax({
                url: vc4g.ajax_url,
                type: "POST",
                data: leadData,
                dataType: 'json',
                beforeSend: function() {
                    $form.css('cursor', 'wait');
                },
                success: function(response) {
                    $form.css('cursor', 'default');
                    if (typeof(response.id) != 'undefined') {
                        var mxProperties = {
                            email: leadData.email,
                            mc_id: response.id
                        };
                        if (typeof(leadData.name) != 'undefined') {
                            mxProperties.name = leadData.name;
                        }
                        if (typeof(leadData.first_name) != 'undefined') {
                            mxProperties['first name'] = leadData.first_name;
                        }
                        if (typeof(leadData.last_name) != 'undefined') {
                            mxProperties['last name'] = leadData.last_name;
                        }
                        if (typeof(analytics) != 'undefined') {
                            analytics.identify(response.id, mxProperties, function(){
                                popDownload($form, response);
                            });
                        }
                        else {
                            popDownload($form, response);
                        }
                    }
                    else {
                        alert(errorMessage);
                    }
                },
                error: function(response) {
                    $form.css('cursor', 'default');
                    alert(errorMessage);
                }
            });
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });

    $("a[data-toggle=\"tab\"]").click(function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
});


/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
    $(this).closest('form').find('#success').html('');
});
