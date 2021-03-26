import { locale } from './components/getLocale';

// TODO: 毎回メソッドを走らせる意味はないのでrefactorする
export let getApiUrl = () => {
    return 'https://' + 'api.' + document.domain;
}

// TODO: 毎回メソッドを走らせる意味はないのでrefactorする
export let getViewFileUrl = () => {
    return 'https://' + 'fileapi.' + document.domain;
}

const rootPageUrl = (() => {
    if (locale == 'en') {
        return 'https://' + document.domain + '/en-US';
    }
    return 'https://' + document.domain
})();

const domain = document.domain;

export { rootPageUrl, domain }