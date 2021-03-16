import '../css/edit.scss'
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { createApp, defineComponent } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getApiUrl } from './url';
import getUrlParameter from './urlParameter';

import {ClassicEditor, MyUploaderAdaptor} from './ckeditor';
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
            ckeditorInstance: null,

            showMemoUrlModal: false,
            showPasswordModal: false,
            modalErrorMessage: '',

            showMessageTime: 3000,
            memoMessages: [],

            autoSaveTimeout: null,
            autoSaveDelay: 5000,

            memo: {
                memoUuid: '',
                memoAlias: '',
                password: '',
                email: '',
                viewId: '',
                isPublic: '',
    
                title: '',
                body: '',

                maxTitleLen: 1000, // py側は1024だが, 余裕を持って.
                maxBodyLen: 1000*1000*4,
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

        ckeditorReady(event) {
            this.ckeditorInstance = event;
            const FileRepository = this.ckeditorInstance.plugins.get("FileRepository");
            FileRepository.createUploadAdapter = loader => {
                return new MyUploaderAdaptor(loader,
                    () => this.memo.password,
                    () => this.memo.memoUuid
                );
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
                this.memo.memoUuid = memo.uuid;
                this.memo.memoAlias = memo.alias_name;
                this.memo.email = memo.email;
                this.memo.viewId = memo.view_id;
                this.memo.isPublic = memo.is_public;

                // 最後にモーダルを閉じる
                this.showPasswordModal = false;

                // 本文が空なら初回扱い
                if (this.memo.body == '') {
                    this.showMemoUrlModal = true;
                }
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
            if (this.autoSaveTimeout) clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = setTimeout(this._save, this.autoSaveDelay);
        },

        instantSave() {
            if (this.autoSaveTimeout) clearTimeout(this.autoSaveTimeout);
            this._save();
        },

        _save() {
            if (this.memo.title.length > this.memo.maxTitleLen) {
                window.alert('タイトルは1000文字以内までです.');
                return;
            }
            if (this.memo.body.length > this.memo.maxBodyLen) {
                window.alert('本文は' + String(this.memo.maxBodyLen) + '文字までです.');
                return;
            }
            axios.post(getApiUrl() + '/save_memo', {
                params: {
                    memo_uuid: this.memo.memoUuid,
                    memo_alias: this.memo.memoAlias,
                    password: this.memo.password,
                    title: this.memo.title,
                    body: this.memo.body,
                }
            }).then(res => {
                console.log(res);
                this.drawMessage('メモを保存しました.');
            }).catch(err => {
                console.log(err);
                window.alert('メモの保存に失敗しました.');
            }).then(() => {});
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

        /**
         * メモ画面にメッセージを表示する
         * 
         * @param {string} message 表示するメッセージ 
         */
        drawMessage(message) {
            console.log('draw message: ' + message);
            const uuid = uuidv4();
            this.memoMessages.push({uuid: uuid, message: message});
            setTimeout(()=>{this.deleteMessage(uuid)}, this.showMessageTime);
        },

        /**
         * メッセージを削除する
         * 
         * @param {string} uuid 削除するメッセージのuuid 
         */
        deleteMessage(uuid) {
            const delIdx = this.memoMessages.findIndex(e => e.uuid == uuid);
            if (delIdx >= 0) {
                this.memoMessages.splice(delIdx, 1);
            }
        },
    },
}).use(CkeditorVue).use(VueFinalModal()).mount('#app');
