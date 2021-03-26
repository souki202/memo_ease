const locale = (() => {
    if (location.href.indexOf('/en-US') >= 0) {
        return 'en';
    }
    return 'ja';
})();

export {locale};