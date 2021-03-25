import { createApp } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { getApiUrl, rootPageUrl } from './url';
import getUrlParameter from './urlParameter';

import { createI18n } from 'vue-i18n'
import { locale } from './components/getLocale';
import messages from './texts/messages';

const i18n = createI18n({
    locale,
    messages,
});

const app = createApp({
    data() {
        return {
            token: '',
        }
    },
    mounted() {
        this.token = getUrlParameter('token');
        this.submit();
    },
    methods: {
        submit() {
            if (!this.token) {
                window.alert('パスワードリセット用のトークンの検出に失敗しました.')
                location.href = rootPageUrl;
            }

            axios.post(getApiUrl() + '/reset_password', {
                params: {
                    token: this.token
                }
            }).then(res => {
                location.href = rootPageUrl + '/edit.html?memo_uuid=' + res.data.uuid
            }).catch(err => {
                if (err.response) {
                    if (err.response.status < 500) {
                        window.alert(this.$t('resetPassword.userError'));
                    }
                    else {
                        window.alert(this.$t('resetPassword.serverError'));
                    }
                }
                else {
                    window.alert(this.$t('resetPassword.unknownError'));
                }
                location.href = rootPageUrl;
            });
        },
    }
}).use(i18n).mount('#app');