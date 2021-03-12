import '../css/edit.scss'
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { createApp, defineComponent } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { getApiUrl } from './url';
import getUrlParameter from './urlParameter';

import ClassicEditor from './ckeditor';
import CkeditorVue from '@ckeditor/ckeditor5-vue';

import VueFinalModal from 'vue-final-modal'
import VModal from './vmodal.vue';

const app = createApp({
    data() {
        return {
            ckeditorClass: ClassicEditor,

            showInputPassword: false,

            memoUuid: '',
            memoAlias: '',
            password: '',

            title: '',
            body: '',
        }
    },
    mounted() {
        // urlからメモIDかaliasを抽出
        this.memoUuid = getUrlParameter('memo_uuid');
        this.memoAlias = getUrlParameter('memo_alias');

        // 初期化
        // this.init();
    },
    methods: {
        init: async function () {
            console.log("hgoehgoehgoe");
            const hasPassword = await this.checkHasPassword();
            if (hasPassword) {
                // パスワード入力画面
            }
        },
        getMemoData() {

        },
        checkHasPassword: async function () {
            let hasPassword = false;
            await axios.get(getApiUrl() + '/check_has_password_memo', {
                params: {
                    memo_uuid: this.memoUuid,
                    memo_alias: this.memoAlias,
                }
            }).then(res => {
                if (res.data) {
                    hasPassword = res.data.has_password;
                }
                console.log(res);
            }).catch(err => {
                console.log(err);
            }).then(() => {

            });
            return hasPassword;
        },
        save() {

        },
    },
}).use(CkeditorVue).mount('#editor');

const sidebar = createApp({
    components: {
        VModal: VModal,
    },
    data() {
        return {
            modals: {
                settings: false,
            },
        }
    },
    methods: {
        openModal(modalId) {
            this.modals[modalId] = true;
        },
        closeModal(modalId) {
            this.modals[modalId] = false;
        }
    },
}).use(VueFinalModal()).mount('#sidebarApp');