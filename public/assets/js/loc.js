function popFeatured (c) {
    if ( $('#index-featured-products').length ) {
        var p = ['$ 9.95 CAD', '$ 11.95 CAD', '$ 7.95 CAD', '$ 7.50 CAD', '$ 10.95 CAD', '$ 9.95 CAD', '$ 9.95 CAD'];

        if (c == 'US') {
            p = ['$ 5.95 USD', '$ 8.50 USD', '$ 5.50 USD', '$ 5.50 USD', '$ 8.50 USD', '$ 7.95 USD', '$ 7.95 USD'];
        }

        $('#featured-item-1 > div.shop-item-summary > div.shop-item-price').text(p[0]);
        $('#featured-item-2 > div.shop-item-summary > div.shop-item-price').text(p[1]);
        $('#featured-item-3 > div.shop-item-summary > div.shop-item-price').text(p[2]);
        $('#featured-item-4 > div.shop-item-summary > div.shop-item-price').text(p[3]);
        $('#featured-item-5 > div.shop-item-summary > div.shop-item-price').text(p[4]);
        $('#featured-item-6 > div.shop-item-summary > div.shop-item-price').text(p[5]);
        $('#featured-item-7 > div.shop-item-summary > div.shop-item-price').text(p[6]);
    }
}

var uCrId = Cookies.get('uCrId');
if (!uCrId) {

    $.getJSON('https://ipinfo.io/?token=039ebf07f4a8d2', function (res) {
        Cookies.set('uCrId', res.country, {domain: document.domain, path: '/', secure: true});

        uCrId = res.country;

        if (uCrId === 'US') {
            $('#top-bar-country-img').attr('src', '/assets/images/flags/us.png');
            $('#top-bar-country-text').text('USD');
            popFeatured(uCrId);
        }
        else {
            $('#top-bar-country-img').attr('src', '/assets/images/flags/ca.png');
            $('#top-bar-country-text').text('CAD');
            popFeatured(uCrId);
        }
    });
}

else if (uCrId && (uCrId === 'US')) {
    $('#top-bar-country-img').attr('src', '/assets/images/flags/us.png');
    $('#top-bar-country-text').text('USD');
    popFeatured(uCrId);
}
else if (uCrId) {
    $('#top-bar-country-img').attr('src', '/assets/images/flags/ca.png');
    $('#top-bar-country-text').text('CAD');
    popFeatured(uCrId);
}
