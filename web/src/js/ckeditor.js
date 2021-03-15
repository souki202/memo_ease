// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';     // <--- ADDED

import axios from 'axios';
import { getApiUrl, getViewFileUrl } from './url';

const MAX_UPLOAD_SIZE = 1024 * 1024 * 8

class ClassicEditor extends ClassicEditorBase {}

class MyUploaderAdaptor {
    constructor(loader, passwordGetter, uuidGetter) {
        // CKEditor 5's FileLoader instance.
        this.loader = loader;
        this.passwordGetter = passwordGetter;
        this.memoUuidGetter = uuidGetter;
    }

    upload() {
        return this.loader.file.then(file => 
            new Promise((resolve, reject) => {
                this._createUrlAndUpload(resolve, reject, file);
            })
        );
    }

    _createUrlAndUpload(resolve, reject, file) {
        console.log(file);
        if (file.size > MAX_UPLOAD_SIZE) {
            return reject('ファイルサイズの上限は8MBです.');
        }
        axios.post(getApiUrl() + '/create_upload_url', {
            params: {
                memo_uuid: this.memoUuidGetter(),
                password: this.passwordGetter(),
                file_name: file.name,
                file_size: file.size,
            }
        }).then(res => {
            console.log(res);
            this._upload(resolve, reject, file, res.data.url, res.data.key)
        }).catch(err => {
            console.log(err);
            if (err.response) {
                if (err.response.status >= 500) {
                    reject('サーバーエラーが発生しました.')
                }
                else {
                    reject('アップロードに失敗しました.')
                }
            }
            else {
                reject('不明なエラーが発生しました.')
            }
        }).then(() => {});
        }

    _upload(resolve, reject, file, url, key) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            axios({
                method: 'PUT',
                url: url,
                headers: {
                    'Content-Type': file.type
                },
                data: reader.result
            }).then(res => {
                console.log(res);
                const path = getViewFileUrl() + '/uploads/' + this.memoUuidGetter() + '/' + key
                console.log('path: ' + path)
                resolve({
                    default: path
                });
            }).catch(err => {
                console.log(err);
                reject('アップロードに失敗しました.');
            }).then(() => {

            })
        };
    }
}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
    Essentials,
    UploadAdapter,
    Autoformat,
    Bold,
    Italic,
    BlockQuote,
    EasyImage,
    Heading,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    Link,
    List,
    Paragraph,
    Alignment,
    CodeBlock,
];

// Editor configuration.
ClassicEditor.defaultConfig = {
    toolbar: {
        items: [
            'heading',
            '|',
            'alignment',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            'ImageUpload',
            'blockQuote',
            'undo',
            'redo',
        ],
    },
    image: {
        toolbar: [
            'imageStyle:full',
            'imageStyle:side',
            '|',
            'imageTextAlternative',
        ],
    },
    // This value must be kept in sync with the language defined in webpack.config.js.
    language: 'jp',
};

export {ClassicEditor, MyUploaderAdaptor}