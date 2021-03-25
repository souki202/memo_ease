import { locale } from './components/getLocale';

const nowEnv = (() => {
    switch (document.domain) {
        case 'localhost':
        case '127.0.0.1':
        case 'dev-memo-ease.tori-blog.net':
            return 'dev';
        case 'stg-memo-ease.tori-blog.net':
            return 'stg'
        case 'memo-ease.com':
            return 'prod';
        default:
            return 'prod';
    }
})();

// TODO: まだメソッドで呼ばれているのでその修正
export default (() => nowEnv);