import '../css/common.scss';
import '../css/index.scss';

import { createApp } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { getApiUrl } from './url';
import { getHistories } from './history.js';
import { createI18n } from 'vue-i18n'

import messages from './texts/messages';

import { locale } from './components/getLocale';

// parts
import MyHeader from './components/header.vue';

const i18n = createI18n({
    locale,
    messages,
});

const createMemo = createApp({
    components: {MyHeader},
    data() {
        return {
            isLoading: false,
            errorMessage: '',
            memoAlias: '',
            memoHistories: '',
        };
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

        // タイトル部分の翻訳
        document.title = this.$t('index.title');

        // OGPの書き換え
        document.querySelector('meta[property="og:title"]').content = this.$t('index.ogp.title');
        document.querySelector('meta[property="og:site_name"]').content = this.$t('index.ogp.siteName');
        document.querySelector('meta[property="og:description"]').content = this.$t('index.ogp.description');
        document.querySelector('meta[property="og:locale"]').content = this.$t('index.ogp.locale');
        // ついでに
        document.querySelector('meta[name="description"]').content = this.$t('index.ogp.description');
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
                    this.errorMessage = this.$t('messages.createError');
                }).then(() => {
                    this.isLoading = false;
                });
        },

        edit() {
            this.errorMessage = '';
            axios.get(getApiUrl() + '/check_exist_memo', {
                params: {memo_alias: this.memoAlias}
            })
            .then(res => {
                location.href = '/edit.html?memo_alias=' + encodeURIComponent(this.memoAlias);
            }).catch(err => {
                if (err.response) {
                    if (err.response.status == 404) {
                        this.errorMessage = this.$t('messages.notFoundMemo');
                    }
                    else {
                        this.errorMessage = this.$t('messages.failedToFindMemo');
                    }
                }
                else {
                    this.errorMessage = this.$t('messages.failedToFindMemo');
                }
            });
        }
    }
}).use(i18n).mount('#app');