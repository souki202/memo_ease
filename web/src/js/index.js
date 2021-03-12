import '../css/common.scss'

import { createApp } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { getApiUrl } from './url';

const createMemo = createApp({
    data() {
        return {
        };
    },
    methods: {
        submit() {
            axios.post(getApiUrl() + '/createMemo')
                .then(res => {
                    console.log(res);
                }).catch(err => {
                    console.log(err);
                });
        },
    }
}).mount('#createMemo');