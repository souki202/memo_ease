import { createApp } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { getApiUrl } from './url';

import { locale } from './components/getLocale';

import { createI18n } from 'vue-i18n'
import messages from './texts/messages';

import MyHeader from './components/header.vue';

const i18n = createI18n({
    locale,
    messages,
});

const app = createApp({
    components: {MyHeader},
    data() {
        return {
            title: '',
            email: '',
            body: '',
            isSubmiting: false,
            isSuccess: false,
        }
    },
    mounted() {
        document.title = this.$t('feedback.title');
    },
    methods: {
        submit(e) {
            this.isSuccess = false;
            if (!this.body) {
                return;
            }

            const _this = this;

            grecaptcha.ready(function() {
                grecaptcha.execute('6LfMH4UaAAAAADcm9EflBnA-J2TeMy_EorpcJCR8', {action: 'submit'}).then(function (token) {
                    axios.post(getApiUrl() + '/feedback', {
                        params: {
                            title: _this.title,
                            email: _this.email,
                            body: _this.body,
                            token: token,
                        }
                    }).then(res => {
                        console.log(res);
                        _this.isSuccess = true;
                    }).catch(err => {
                        console.log(err);
                        window.alert(this.$t('feedback.failed'));
                    }).then(() => {
                        _this.isSubmiting = false;
                    });
                });
            });
            return false;
        },
    },
}).use(i18n).mount('#app');