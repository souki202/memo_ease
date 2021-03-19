import '../css/common.scss';
import '../css/index.scss';

import { createApp } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { getApiUrl } from './url';
import { getHistories } from './history.js';

const createMemo = createApp({
    data() {
        return {
            isLoading: false,
            errorMessage: ''
        };
    },
    methods: {
        submit() {
            this.errorMessage = '';
            this.isLoading = true;
            axios.post(getApiUrl() + '/create_memo')
                .then(res => {
                    if (res.data.memo_uuid) {
                        location.href = "/edit.html?memo_uuid=" + res.data.memo_uuid;
                    }
                }).catch(err => {
                    this.errorMessage = 'ユーザごとの一定時間内に作成できる上限に達したか, 内部エラーが発生しました.';
                }).then(() => {
                    this.isLoading = false;
                });
        },
    }
}).mount('#createMemo');

const editMemo = createApp({
    data() {
        return {
            errorMessage: '',
            memoAlias: '',
            memoHistories: '',
        }
    },
    mounted() {
        const histories = getHistories();
        const ary = []
        for (const key in histories) {
            let tmpValue = histories[key]
            tmpValue['memoUuid'] = key;
            ary.push(tmpValue);
        }
        this.memoHistories = ary;
    },
    methods: {
        submit() {
            axios.get(getApiUrl() + '/check_exist_memo', {
                params: {memo_alias: this.memoAlias}
            })
            .then(res => {
                location.href = '/edit.html?memo_alias=' + encodeURIComponent(this.memoAlias);
            }).catch(err => {
                if (err.response) {
                    if (err.response.status == 404) {
                        this.errorMessage = 'メモが見つかりませんでした.';
                    }
                    else {
                        this.errorMessage = 'メモの検索に失敗しました.';
                    }
                }
                else {
                    this.errorMessage = 'メモの検索に失敗しました.';
                }
            });
        }
    }
}).mount('#editMemo');