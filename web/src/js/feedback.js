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
        }
    },
    methods: {
        submit() {
            if (!body) {
                window.alert('本文は必須です');
                return;
            }

            this.isSubmiting = true;

            axios.post(getApiUrl() + '/feedback', {
                params: {
                    title: this.title,
                    email: this.email,
                    body: this.body,
                }
            }).then(res => {
                console.log(res);
            }).catch(err => {
                console.log(err);
                window.alert('お問合せの送信に失敗しました.');
            }).then(() => {
                this.isSubmiting = false;
            });
        },
    },
}).mount('#feedbackForm');