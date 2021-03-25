const locale = (() => {
    if (location.href.indexOf('/en/') >= 0) {
        return 'en';
    }
    return 'ja';
})();

export {locale};