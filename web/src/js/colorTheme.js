import Cookies from 'js-cookie';

function _getTheme() {
    const theme = Cookies.get('theme');
    if (!theme || theme == 'light') {
        return 'light';
    }
    else {
        return 'dark'
    }
}

export let getTheme = _getTheme