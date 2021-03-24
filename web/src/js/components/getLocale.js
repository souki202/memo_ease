const locale = (() => {
    if (document.domain.indexOf('en.') === 0) {
        return 'en';
    }
    return 'en';
})();

export {locale};