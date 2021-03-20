import { createApp } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { getApiUrl } from './url';
import getUrlParameter from './urlParameter';

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
                location.href = '/';
            }

            axios.post(getApiUrl() + '/reset_password', {
                params: {
                    token: this.token
                }
            }).then(res => {
                location.href = '/edit.html?memo_uuid=' + res.data.uuid
            }).catch(err => {
                if (err.response) {
                    if (err.response.status < 500) {
                        window.alert('パスワードのリセットに失敗しました. URLの有効期限が切れている可能性があります.');
                    }
                    else {
                        window.alert('サーバーエラが発生しました.');
                    }
                }
                else {
                    window.alert('サーバーエラが発生しました.');
                }
                location.href = '/';
            });
        },
    }
}).mount('#app');