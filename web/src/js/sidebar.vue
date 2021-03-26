<template>
    <div class="sidebar-container" id="sidebarApp">
        <input type="checkbox" name="switchSidebar" id="switchSidebar">
        <div id="sidebar">
            <div class="sidebar-inner">
                <label for="switchSidebar" class="sidebar-close-bg"></label>
                <div class="content-list">
                    <h2 class="content-header">Contents</h2>
                    <ul>
                        <li>
                            <div class="content-icon"><i class="fas fa-tags"></i></div>
                            <div class="content-title">{{$t('edit.sidebar.memoId.title')}}</div>
                            <span class="no-decolarion-link" @click="openModal('aliasSettings')"></span>
                        </li>
                        <li>
                            <div class="content-icon"><i class="fas fa-key"></i></div>
                            <div class="content-title">{{$t('edit.sidebar.password.title')}}</div>
                            <span class="no-decolarion-link" @click="openModal('password')"></span>
                        </li>
                        <li>
                            <div class="content-icon"><i class="fas fa-link"></i></div>
                            <div class="content-title">{{$t('edit.sidebar.share.title')}}</div>
                            <span class="no-decolarion-link" @click="openModal('publish')"></span>
                        </li>
                    </ul>
                </div>
                <div class="content-list site-info-list">
                    <div class="sidebar-separator"></div>
                    <ul>
                        <li>
                            <div class="content-icon"><i class="fas fa-home"></i></div>
                            <div class="content-title">{{$t('edit.sidebar.links.home')}}</div>
                            <a class="no-decolarion-link" href="./" target="blank"></a>
                        </li>
                        <li>
                            <div class="content-icon"><i class="fas fa-comment-alt"></i></div>
                            <div class="content-title">{{$t('edit.sidebar.links.feedback')}}</div>
                            <a class="no-decolarion-link" href="./feedback.html" target="blank"></a>
                        </li>
                        <li>
                            <div class="content-icon"><i class="far fa-file-alt"></i></div>
                            <div class="content-title">{{$t('edit.sidebar.links.tos')}}</div>
                            <a class="no-decolarion-link" :href="$t('url.tos')" target="blank"></a>
                        </li>
                        <li>
                            <div class="content-icon"><i class="fas fa-user-secret"></i></div>
                            <div class="content-title">{{$t('edit.sidebar.links.privacy')}}</div>
                            <a class="no-decolarion-link" :href="$t('url.privacy')" target="blank"></a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="modals">
            <v-modal v-model="modals.aliasSettings" @close="closeModal" :modal-id="'aliasSettings'">
                <template v-slot:title>{{$t('edit.sidebar.memoId.header')}}</template>
                <div>
                    <p>{{$t('edit.sidebar.memoId.warning')}}</p>
                    <form action="" method="post" @submit.prevent="updateMemoAlias">
                        <div class="form-group">
                            <label for="memoName" class="modal-form-label">{{$t('edit.sidebar.memoId.label')}}</label>
                            <input type="text" class="form-control" id="memoName" v-model="memoAliasInput" maxlength="1000">
                        </div>
                        <button type="submit" class="btn btn-primary" :disabled="isSubmiting">{{$t('edit.sidebar.memoId.update')}}</button>
                    </form>
                </div>
            </v-modal>
            <v-modal v-model="modals.password" @close="closeModal" :modal-id="'password'">
                <template v-slot:title>{{$t('edit.sidebar.password.header')}}</template>
                <div>
                    <p>{{$t('edit.sidebar.password.note')}}</p>
                    <form action="" method="post" @submit.prevent="updatePassword">
                        <div class="form-group">
                            <div class="input-group">
                                <label for="nowPassword2" class="modal-form-label">{{$t('edit.sidebar.password.current')}}</label>
                                <input type="password" class="form-control" id="nowPassword2" v-model="passwordInput" readonly>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-group">
                                <label for="newPassword" class="modal-form-label">{{$t('edit.sidebar.password.new1')}}</label>
                                <input type="password" class="form-control" id="newPassword" v-model="newPassword" maxlength="1000">
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-group">
                                <label for="newPassword2" class="modal-form-label">{{$t('edit.sidebar.password.new2')}}</label>
                                <input type="password" class="form-control" id="newPassword2" v-model="newPassword2" maxlength="1000">
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-group">
                                <label for="resetEmail" class="modal-form-label">{{$t('edit.sidebar.password.resetEmail')}}</label>
                                <input type="email" class="form-control" id="resetEmail" v-model="email" maxlength="1000">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" :disabled="isSubmiting">{{$t('edit.sidebar.password.update')}}</button>
                    </form>
                </div>
            </v-modal>
            <v-modal v-model="modals.publish" @close="closeModal" :modal-id="'publish'">
                <template v-slot:title>{{$t('edit.sidebar.share.header')}}</template>
                <div>
                    <p>{{$t('edit.sidebar.share.note')}}</p>
                    <div class="form-group">
                        <!-- メモURL -->
                        <div class="input-group memo-link">
                            <label for="viewUrl" class="modal-form-label">{{$t('edit.sidebar.share.url')}}</label>
                            <div class="input-group-prepend">
                                <div class="input-group-text copy-to-clipboard" @click="copyViewUrl">
                                    <i class="fas fa-clipboard"></i>
                                </div>
                            </div>
                            <input type="text" class="form-control text-light bg-dark" name="viewUrl" id="viewUrl" :value="isPublic ? viewUrl : ''" readonly>
                        </div>
                        <!-- iframe埋め込みコード -->
                        <div class="input-group memo-link">
                            <label for="iframeCode" class="modal-form-label">{{$t('edit.sidebar.share.embed')}}</label>
                            <div class="input-group-prepend">
                                <div class="input-group-text copy-to-clipboard" @click="copyIframeCode">
                                    <i class="fas fa-clipboard"></i>
                                </div>
                            </div>
                            <input type="text" class="form-control text-light bg-dark" name="iframeCode" id="iframeCode" :value="isPublic ? iframeCode : ''" readonly>
                        </div>
                    </div>
                    <button class="btn btn-primary" v-if="!isPublic" @click="changePublicState(true)" :disabled="isSubmiting">{{$t('edit.sidebar.share.getLink')}}</button>
                    <button class="btn btn-danger" v-if="isPublic" @click="changePublicState(false)" :disabled="isSubmiting">{{$t('edit.sidebar.share.stop')}}</button>
                </div>
            </v-modal>
        </div>

        <div class="sidebar-switch-container">
            <label for="switchSidebar" class="sidebar-switch-label">
                <i class="fas fa-bars fa-2x sidebar-open-button"></i>
                <i class="fas fa-times fa-2x sidebar-close-button"></i>
            </label>
        </div>
    </div>
</template>

<script>
import VModal from './vmodal.vue';
import axios from 'axios';
import { getApiUrl, rootPageUrl } from './url';
import { updateHistory } from './history.js';

export default {
    components: {
        VModal: VModal,
    },
    props: [
        'memoAlias', 'password', 'email', 'viewId', 'isPublic', 'memoUuid', 'title'
    ],
    data() {
        return {
            modals: {
                aliasSettings: false,
                password: false,
                publish: false,
            },
            newPassword: '',
            newPassword2: '',
            modalErrorMessage: '',
            isSubmiting: false,
        }
    },
    computed: {
        memoAliasInput: {
            get() {
                return this.memoAlias; 
            },
            set(value) {
                this.$emit('update:memoAlias', value);
            }
        },
        passwordInput: {
            get() {
                return this.password; 
            },
            set(value) {
                this.$emit('update:password', value);
            }
        },
        emailInput: {
            get() {
                return this.email;
            },
            set(value) {
                this.$emit('update:email', value);
            }
        },
        viewUrl() {
            if (!this.viewId) {
                return '';
            }
            return rootPageUrl + '/view.html?view_id=' + this.viewId;
        },
        iframeCode() {
            if (!this.viewId) {
                return '';
            }
            let code = '<iframe src="' + this.viewUrl + '" width="100%" height="480px">'
            return code
        }
    },
    methods: {
        openModal(modalId) {
            this.modalErrorMessage = '';
            this.modals[modalId] = true;
        },
        closeModal(modalId) {
            this.modals[modalId] = false;
        },

        /**
         * メモのエイリアスを更新
         */
        updateMemoAlias() {// 入力チェック
            if (!this.memoAlias) {
                window.alert(this.$t('edit.sidebar.memoId.notInput'));
                return;
            }

            if (this.memoAlias.length > 1000) {
                windlw.alert(this.$t('edit.sidebar.memoId.maximum'))
            }

            this.isSubmiting = true;
            axios.post(getApiUrl() + '/change_memo_alias', {
                params: {
                    memo_uuid: this.memoUuid,
                    password: this.password,
                    new_memo_alias: this.memoAlias,
                }
            }).then(res => {
                console.log(res);
                updateHistory(this.memoUuid, this.memoAlias, this.title);
                window.alert(this.$t('edit.sidebar.memoId.success'));
            }).catch(err => {
                console.log(err);
                if (err.response) {
                    if (err.response.status < 500) {
                        window.alert(this.$t('edit.sidebar.memoId.duplicate'));
                    }
                    else {
                        window.alert(this.$t('edit.getServerError'));
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
         * メモのパスワードを更新
         */
        updatePassword() {
            // 入力チェック
            if (this.newPassword != this.newPassword2) {
                window.alert(this.$t('edit.sidebar.password.wrong'));
                return;
            }
            if (this.email.length > 1000 || this.newPassword > 1000) {
                windlw.alert(this.$t('edit.sidebar.password.maximum'))
            }
            // Emailだけ変えている場合もありうるので今はチェックしない
            // if (this.password == this.newPassword) {
            //     window.alert('現在のパスワードと新しいパスワードが一致しています.');
            //     return;
            // }
            this.isSubmiting = true;
            axios.post(getApiUrl() + '/update_password', {
                params: {
                    memo_uuid: this.memoUuid,
                    password: this.password,
                    newPassword: this.newPassword,
                    email: this.email,
                }
            }).then(res => {
                console.log(res);
                this.passwordInput = this.newPassword;
                this.newPassword = this.newPassword;
                this.newPassword2 = this.newPassword;
                window.alert(this.$t('edit.sidebar.password.success'));
            }).catch(err => {
                console.log(err);
                window.alert(this.$t('edit.sidebar.password.failed'));
            }).then(() => {
                this.isSubmiting = false;
            });
        },

        /**
         * 閲覧用リンクを生成
         */
        changePublicState(state) {
            this.isSubmiting = true;
            axios.post(getApiUrl() + '/change_public_state', {
                params: {
                    memo_uuid: this.memoUuid,
                    password: this.password,
                    state: state,
                }
            }).then(res => {
                console.log(res);
                this.$emit('update:isPublic', state);
            }).catch(err => {
                console.log(err);
                window.alert(this.$t('edit.sidebar.share.failed'));
            }).then(() => {
                this.isSubmiting = false;
            });
        },

        /**
         * 閲覧用URLを取得
         */
        copyViewUrl() {
            var copyText = document.querySelector("#viewUrl");
            copyText.select();
            document.execCommand("copy");
        },

        /**
         * 閲覧用URLを取得
         */
        copyIframeCode() {
            var copyText = document.querySelector("#iframeCode");
            copyText.select();
            document.execCommand("copy");
        },

        initPassword() {
            this.newPassword = this.password;
            this.newPassword2 = this.password;
        }
    },
}
</script>