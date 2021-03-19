import { createApp } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { getApiUrl } from './url';

const app = createApp({
    data() {
        return {
            title: '',
            email: '',
            body: '',
            isSubmiting: false,
            isSuccess: false,
        }
    },
    methods: {
        submit(e) {
            _this.isSuccess = false;
            if (!this.body) {
                window.alert('本文は必須です');
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
                        window.alert('お問合せの送信に失敗しました.');
                    }).then(() => {
                        _this.isSubmiting = false;
                    });
                });
            });
            return false;
        },
    },
}).mount('#feedbackForm');