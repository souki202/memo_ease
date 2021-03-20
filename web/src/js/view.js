import '../css/view.scss'

import { createApp, defineComponent } from 'vue/dist/vue.esm-bundler.js';
import axios from 'axios';
import { getApiUrl } from './url';

import {ClassicEditor, MyUploaderAdaptor} from './ckeditor';
import CkeditorVue from '@ckeditor/ckeditor5-vue';

import VueFinalModal from 'vue-final-modal';
import VModal from './vmodal.vue';
import getUrlParameter from './urlParameter';

const app = createApp({
    data() {
        return {
            ckeditorClass: ClassicEditor,

            memo: {
                body: '',
                title: '',
                viewId: '',
            }
        }
    },
    mounted() {
        this.memo.viewId = getUrlParameter('view_id');
        this.getMemoData();
    },

    methods: {
        ckeditorReady(editor) {
            editor.isReadOnly = true;
        },
        getMemoData() {
            axios.get(getApiUrl() + '/get_memo_data_by_view_id', {
                params: {
                    view_id: this.memo.viewId,
                }
            }).then(res => {
                // console.log(res.data);
                this.memo.body = res.data.body;
                this.memo.title = res.data.title;
                document.title = this.memo.title + ' MemoEase';
            }).catch(err => {
                console.log(err);
                window.alert('メモの読み込みに失敗しました.');
                location.href = '/';
            }).then(() => {
            });
        }
    }
}).use(CkeditorVue).mount('#app');