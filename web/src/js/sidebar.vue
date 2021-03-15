<template>
    <div class="sidebar-container" id="sidebarApp">
        <input type="checkbox" name="switchSidebar" id="switchSidebar">
        <div id="sidebar">
            <label for="switchSidebar" class="sidebar-close-bg"></label>
            <div class="content-list">
                <h2 class="content-header">Contents</h2>
                <ul>
                    <li>
                        <div class="content-icon"><i class="fas fa-home"></i></div>
                        <div class="content-title">Home</div>
                        <a class="no-decolarion-link" href="/"></a>
                    </li>
                    <li>
                        <div class="content-icon"><i class="fas fa-tags"></i></div>
                        <div class="content-title">メモ名変更</div>
                        <span class="no-decolarion-link" @click="openModal('aliasSettings')"></span>
                    </li>
                    <li>
                        <div class="content-icon"><i class="fas fa-key"></i></div>
                        <div class="content-title">パスワード変更</div>
                        <span class="no-decolarion-link" @click="openModal('password')"></span>
                    </li>
                </ul>
    
            </div>
        </div>

        <div class="modals">
            <v-modal v-model="modals.aliasSettings" @close="closeModal" :modal-id="'aliasSettings'">
                <template v-slot:title>メモの名前設定</template>
                <div>
                    <form action="" method="post" @submit.prevent="updateMemoAlias">
                        <div class="form-group">
                            <label for="memoName" class="modal-form-label">メモの名前</label>
                            <input type="text" class="form-control" id="memoName" v-model="memoAliasInput">
                        </div>
                        <button type="submit" class="btn btn-primary" :disabled="isSubmiting">更新</button>
                    </form>
                </div>
            </v-modal>
            <v-modal v-model="modals.password" @close="closeModal" :modal-id="'password'">
                <template v-slot:title>パスワード設定</template>
                <div>
                    <p>新しいパスワードを空欄にして更新すると, パスワード無しにできます.</p>
                    <form action="" method="post" @submit.prevent="updatePassword">
                        <div class="form-group">
                            <div class="input-group">
                                <label for="nowPassword2" class="modal-form-label">現在のパスワード</label>
                                <input type="password" class="form-control" id="nowPassword2" v-model="passwordInput" readonly>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-group">
                                <label for="newPassword" class="modal-form-label">新しいパスワード</label>
                                <input type="password" class="form-control" id="newPassword" v-model="newPassword">
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-group">
                                <label for="newPassword2" class="modal-form-label">新しいパスワード(確認用)</label>
                                <input type="password" class="form-control" id="newPassword2" v-model="newPassword2">
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="input-group">
                                <label for="resetEmail" class="modal-form-label">再設定用Email</label>
                                <input type="email" class="form-control" id="resetEmail" v-model="email">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" :disabled="isSubmiting">更新</button>
                    </form>
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
import { getApiUrl } from './url';

export default {
    components: {
        VModal: VModal,
    },
    props: [
        'memoAlias', 'password', 'email'
    ],
    data() {
        return {
            modals: {
                aliasSettings: false,
                password: false,
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
                window.alert('メモの名前を入力してください.');
                return;
            }
            this.isSubmiting = true;
            axios.post(getApiUrl() + '/update_memo_alias', {
                params: {
                    memo_alias: this.memoAlias,
                    password: this.password,
                }
            }).then(res => {
                console.log(res);
            }).catch(err => {
                console.log(err);
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
                window.alert('パスワードの入力が一致しません.');
                return;
            }
            // Emailだけ変えている場合もありうるので今はチェックしない
            // if (this.password == this.newPassword) {
            //     window.alert('現在のパスワードと新しいパスワードが一致しています.');
            //     return;
            // }
            this.isSubmiting = true;
            axios.post(getApiUrl() + '/update_password', {
                params: {
                    memo_alias: this.memoAlias,
                    password: this.password,
                    newPassword: this.newPassword,
                    email: this.email,
                }
            }).then(res => {
                console.log(res);
                this.passwordInput = this.newPassword;
                window.alert('パスワード設定を更新しました.');
            }).catch(err => {
                console.log(err);
                window.alert('パスワード設定の更新に失敗しました.');
            }).then(() => {
                this.isSubmiting = false;
            });
        },
    },
}
</script>