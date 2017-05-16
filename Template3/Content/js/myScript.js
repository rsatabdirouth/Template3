(function ($, window) {
    $(document).ready(function(){
        $('body').show();
    });

    var baseUrl='https://alds.pioneer-web.com/sherlockapi/';
    //var baseUrl = 'http://localhost/sherlockapi/';

    $.extend({
        getQueryString: function (name) {
            function parseParams() {
                var params = {},
                    e,
                    a = /\+/g,  // Regex for replacing addition symbol with a space
                    r = /([^&=]+)=?([^&]*)/g,
                    d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
                    q = window.location.search.substring(1);

                while (e = r.exec(q))
                    params[d(e[1])] = d(e[2]);

                return params;
            }

            if (!this.queryStringParams)
                this.queryStringParams = parseParams();

            return this.queryStringParams[name];
        }
    });

    // Add a new validator
    $.formUtils.addValidator({
        name: 'ukpostcode',
        validatorFunction: function (val, $el, config, language, $form) {
            return isValidPostcode(val);
        },
        errorMessage: 'Please enter valid postcode',
        errorMessageKey: 'badPostcode'
    });

    $.formUtils.addValidator({
        name: 'ukphone',
        validatorFunction: function (val, $el, config, language, $form) {
            return isValidUKPhone(val);
        },
        errorMessage: 'Please enter valid phone number',
        errorMessageKey: 'badPhoneNumber'
    });

    function isValidPostcode(val) {
        var regexp = /^[a-zA-Z]{1,2}[0-9][0-9A-Za-z]? {0,1}[0-9][a-zA-Z]{2}$/;
        return regexp.test(val);
    }

    function isValidUKPhone(val) {
        var regexp = /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/;
        return regexp.test(val);
    }

    window.applyValidation = function (validateOnBlur, forms, messagePosition, scrollToTopOnError, ajaxMode, callback) {
        if (!forms)
            forms = 'form';

        if (!messagePosition)
            messagePosition = 'top';

        if (scrollToTopOnError == undefined) {
            scrollToTopOnError = true;
        }

        if (ajaxMode == undefined)
            ajaxMode = false;

        $.validate({
            form: forms,
            language: {
                requiredFields: '*',
                errorTitle: 'Please correct the errors shown below !'
            },
            validateOnBlur: validateOnBlur,
            errorMessagePosition: messagePosition,
            scrollToTopOnError: scrollToTopOnError,
            lang: 'en',
            borderColorOnError: 'red',
            onModulesLoaded: function () {
            },
            onValidate: function ($f) {
            },
            onError: function ($form) {
            },
            onSuccess: function ($form) {
                if (callback && typeof callback == 'function')
                    callback($form[0].id);
                return !ajaxMode;
            },
            onElementValidate: function (valid, $el, $form, errorMess) {
                var isFormValid = $('#' + $form[0].id).isValid({}, {}, false);
                if (isFormValid) {
                    $('.alert-danger').hide();
                }
                else {
                    $('.alert-danger').show();
                }
            }
        });
    };

    window.applyValidation(true, '#homeForm', 'top', true, true, submitForm);
    window.applyValidation(true, '#requestCallForm', 'top', false, true, submitForm);


    function submitForm($form) {
        $('#' + $form + ' :submit')[0].setAttribute("disabled", "disabled");
        $('#' + $form + ' :submit')[0].value = 'Please wait...';

        var url = baseUrl + 'api/Sherlock/capturelead';
        var src = $.getQueryString('src') || '';
        var kw = $.getQueryString('kw') || '';
        var mch = $.getQueryString('mch') || '';

        var data = { siteId: 41, OrganizationHashCode: 'P7BMCP08LZ1CVY59', Source: src, Keyword: kw, MatchType: mch };

        var serlializeArray = $('#' + $form).serializeArray();
        $.map(serlializeArray, function (x) {
            data[x.name] = x.value;
        });       
        sendAjax('POST', url, data, onSuccessSubmit, $form);
    }
    function createAjax() {
        var ajaxHttp = null;
        try {
            if (typeof ActiveXObject == 'function')
                ajaxHttp = new ActiveXObject("Microsoft.XMLHTTP");
            else
                if (window.XMLHttpRequest)
                    ajaxHttp = new XMLHttpRequest();
        }
        catch (e) {
            alert(e.message);
            return null;
        }
        return ajaxHttp;
    };

    function sendAjax(method, url, data, onSuccessMethod, $form) {
        if (!method)
            method = 'GET';
        if (!data)
            data = null;

        var AJAXobj = createAjax();
        AJAXobj.onreadystatechange = function () {
            if (AJAXobj.readyState === 4) {
                if (AJAXobj.status === 200) {
                    if (typeof onSuccessMethod == 'function') {
                        onSuccessMethod(AJAXobj, $form);
                    }
                }
                else {
                    $('#' + $form + ' :submit')[0].removeAttribute("disabled");
                    $('#' + $form + ' :submit')[0].value = $('#' + $form + ' .btnName').text();
                }

            }
        };
        var strData = JSON.stringify(data);
        AJAXobj.open(method, url, true);
        AJAXobj.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        AJAXobj.send(strData);
    }
    window.resetRequestCall = function () {
        $("#requestSubmit").removeAttr("disabled");
        $('#requestCallForm')[0].reset();   
        $('#requestCallForm' + ' :submit')[0].value = $('#requestCallForm' + ' .btnName').text();   
        $('#requestCallForm .modal-body').show();
        $('#requestCallForm .modal-body2').hide();
    };
    window.callNowClick = function () {
        var urlClickMe = baseUrl + 'clickme/41';
        sendAjax('POST', urlClickMe);
    }
    function onSuccessSubmit(shttp, $form) {
        $('#' + $form + ' :submit')[0].removeAttribute("disabled");
        $('#' + $form + ' :submit')[0].value = $('#' + $form + ' .btnName').text();
        $('#' + $form)[0].reset();
        $('#' + $form + ' .modal').modal('show');
        $('#' + $form + ' .modal-body').hide();
        $('#' + $form + ' .modal-body2').show();
    }

})(jQuery, window);