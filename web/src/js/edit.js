import '../css/edit.scss'
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { createApp, defineComponent } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { getApiUrl } from './url';
import getUrlParameter from './urlParameter';

import ClassicEditor from './ckeditor';
import CkeditorVue from '@ckeditor/ckeditor5-vue';

import VueFinalModal from 'vue-final-modal';
import VModal from './vmodal.vue';

import Sidebar from './sidebar.vue';

const app = createApp({
    components: {
        VModal: VModal,
        Sidebar: Sidebar,
    },
    data() {
        return {
            ckeditorClass: ClassicEditor,

            showMemoUrlModal: false,
            showPasswordModal: false,
            modalErrorMessage: '',

            memo: {
                memoUuid: '',
                memoAlias: '',
                password: '',
                email: '',
                viewId: '',
    
                title: '',
                body: '',
            },

            isSubmiting: false,
        }
    },
    mounted() {
        // urlからメモIDかaliasを抽出
        this.memo.memoUuid = getUrlParameter('memo_uuid');
        this.memo.memoAlias = getUrlParameter('memo_alias');

        if (!this.memo.memoAlias) {
            this.memo.memoAlias = this.memo.memoUuid;
        }

        // 新規作成か
        if (getUrlParameter('new')) {
            this.showMemoUrlModal = true;
        }

        // 初期化
        this.init();
    },
    computed: {
        memoUrl() {
            return 'https://' + document.domain + '/edit.html?memo_uuid=' + this.memo.memoUuid;
        },
    },
    methods: {
        init: async function () {
            console.log("hgoehgoehgoe");
            const hasPassword = await this.checkHasPassword();
            if (hasPassword) {
                // パスワード入力画面
                this.showPasswordModal = true;
            }
            else {
                // パス無しならここでメモ全体を取得
                this.getMemoData();
            }
        },

        /**
         * メモ情報を取得
         */
        getMemoData() {
            this.isSubmiting = true;
            axios.post(getApiUrl() + '/get_memo', {
                params: {
                    memo_uuid: this.memo.memoUuid,
                    memo_alias: this.memo.memoAlias,
                    password: this.memo.password,
                }
            }).then(res => {
                console.log(res.data);
                const memo = res.data.memo;
                this.memo.body = memo.body;
                this.memo.title = memo.title;
                this.memo.memoUuid = memo.memo_uuid;
                this.memo.memoAlias = memo.alias_name;
                this.memo.email = memo.email;
                this.memo.viewId = memo.view_id;

                // 最後にモーダルを閉じる
                this.showPasswordModal = false;
            }).catch(err => {
                console.log(err);
            }).then(() => {
                this.isSubmiting = false;
            });
        },

        /**
         * そのメモにパスワードが設定されているかチェック
         * @returns {boolean} 設定されいればtrue
         */
        checkHasPassword: async function () {
            let hasPassword = false;
            this.isSubmiting = true;
            await axios.get(getApiUrl() + '/check_has_password_memo', {
                params: {
                    memo_uuid: this.memo.memoUuid,
                    memo_alias: this.memo.memoAlias,
                }
            }).then(res => {
                if (res.data) {
                    hasPassword = res.data.has_password;
                }
                console.log(res);
            }).catch(err => {
                if (err.response) {
                    if (err.response.status >= 500) {
                        window.alert('サーバーエラーが発生しました.');
                    }
                    else {
                        window.alert('パスワードが間違っています.');
                    }
                }
                else {
                    window.alert('エラーが発生しました.');
                }
            }).then(() => {
                this.isSubmiting = false;
            });
            return hasPassword;
        },

        /**
         * メモ本文の保存処理
         */
        save() {

        },

        /**
         * メモ作成時のモーダルを閉じる
         */
        closeNewMemoUrlModal() {
            this.showMemoUrlModal = false;
        },

        closePasswordModal() {
            this.showPasswordModal = false;
        },

        /**
         * 編集リンクをクリップボードにコピー
         */
        copyMemoUrl() {
            var copyText = document.querySelector("#memoUrl");
            copyText.select();
            document.execCommand("copy");
        },
    },
}).use(CkeditorVue).use(VueFinalModal()).mount('#app');
