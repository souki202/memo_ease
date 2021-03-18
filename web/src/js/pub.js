import { createApp } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { getApiUrl } from './url';

const app = createApp({
    data() {
        return {
            isLoading: false,
        };
    },
    methods: {
        submit() {
            this.isLoading = true;
            axios.post(getApiUrl() + '/create_memo')
                .then(res => {
                    if (res.data.memo_uuid) {
                        location.href = "/edit.html?memo_uuid=" + res.data.memo_uuid;
                    }
                }).catch(err => {
                    window.alert('ユーザごとの一定時間内に作成できる上限に達したか, 内部エラーが発生しました.');
                    console.log(err);
                }).then(() => {
                    this.isLoading = false;
                });
        },
    }
});

export default app;