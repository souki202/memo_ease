import '../css/edit.scss'
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { createApp, defineComponent } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getApiUrl } from './url';
import getUrlParameter from './urlParameter';

import { createI18n } from 'vue-i18n'

import messages from './texts/messages';
import { locale } from './components/getLocale';

import { ClassicEditor, MyUploaderAdaptor } from './ckeditor';
import CkeditorVue from '@ckeditor/ckeditor5-vue';

import VueFinalModal from 'vue-final-modal';
import VModal from './vmodal.vue';

import Sidebar from './sidebar.vue';

import { updateHistory } from './history.js';

const i18n = createI18n({
    locale,
    messages,
});

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
            autoSaveDelay: 3000,

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
            isSuccessGenerateResetPassword: false,
        }
    },
    mounted() {
        // urlからメモIDかaliasを抽出
        this.memo.memoUuid = getUrlParameter('memo_uuid');
        this.memo.memoAlias = getUrlParameter('memo_alias');

        if (!this.memo.memoAlias && !this.memo.memoUuid) {
            window.alert(this.$t('edit.notSet'));
            location.href = '/';
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

            // 画像アップロードの設定
            const FileRepository = this.ckeditorInstance.plugins.get("FileRepository");
            FileRepository.createUploadAdapter = loader => {
                return new MyUploaderAdaptor(loader,
                    () => this.memo.password,
                    () => this.memo.memoUuid
                );
            }

            // 出力コードの設定
            this.ckeditorInstance.editorConfig = function (config) {
                config.allowedContent = true;
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

                // タイトル更新
                document.title = this.memo.title + ' MemoEase';

                // 編集履歴に追加
                updateHistory(this.memo.memoUuid, this.memo.memoAlias, this.memo.title);

                // サイドバーのモーダルの新しいパスワードに規定値設定
                if (this.memo.password) {
                    this.$refs.sidebar.initPassword();
                }
            }).catch(err => {
                console.log(err);
                if (err.response) {
                    if (err.response.status < 500) {
                        window.alert(this.$t('edit.password.wrongPassword'));
                    }
                    else {
                        window.alert(this.$t('edit.notFound'));
                    }
                }
                else {
                    window.alert(this.$t('edit.getError'));
                }
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
                        window.alert(this.$t('edit.getServerError'));
                    }
                    else {
                        window.alert(this.$t('edit.password.wrongPassword'));
                    }
                }
                else {
                    window.alert(this.$t('edit.getError'));
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
                    password: this.memo.password,
                    title: this.memo.title,
                    body: this.memo.body,
                }
            }).then(res => {
                console.log(res);
                this.drawMessage('メモを保存しました.');
                updateHistory(this.memo.memoUuid, this.memo.memoAlias, this.memo.title);
            }).catch(err => {
                console.log(err);
                window.alert('メモの保存に失敗しました.');
            }).then(() => {});
        },

        passwordReset() {
            if (this.isSubmiting) {
                return;
            }
            this.isSuccessGenerateResetPassword = false;
            this.isSubmiting = true;
            axios.post(getApiUrl() + '/generate_reset_password_token', {
                params: {
                    memo_uuid: this.memo.memoUuid,
                    memo_alias: this.memo.memoAlias
                }
            }).then(res => {
                this.isSuccessGenerateResetPassword = true;
            }).catch(err => {
                if (err.response) {
                    if (err.response.status == 406) {
                        window.alert('リセット用メールの送信に失敗しました. メールアドレスが設定されていない可能性があります.');
                    }
                }
                else {
                    window.alert('サーバーエラーによりリセット用メールの送信に失敗しました.');
                }
            }).then(() => {
                this.isSubmiting = false;
            });
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
}).use(i18n).use(CkeditorVue).use(VueFinalModal()).mount('#app');
