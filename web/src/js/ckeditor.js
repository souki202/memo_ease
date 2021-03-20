// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';

import Link from '@ckeditor/ckeditor5-link/src/link';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';

import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import StrikeThrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import SubScript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import SuperScript from '@ckeditor/ckeditor5-basic-styles/src/superscript';

import List from '@ckeditor/ckeditor5-list/src/list';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';

import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';

import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';

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
    BlockQuote,
    EasyImage,
    Heading,
    Link,
    Paragraph,
    Alignment,
    CodeBlock,
    Clipboard,

    // フォントそのもの群
    FontFamily,
    FontColor,
    FontBackgroundColor,
    FontSize,
    // 文字装飾群
    Bold,
    Italic,
    StrikeThrough,
    SubScript,
    SuperScript,

    // List
    List,
    TodoList,
    Indent,

    // 画像
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    ImageInsert,
    MediaEmbed,

    // Table
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
];

// Editor configuration.
ClassicEditor.defaultConfig = {
    toolbar: {
        items: [
            'heading', '|',
            'fontfamily', 'fontsize', 'fontcolor', 'fontbackgroundcolor', '|',
            'bold', 'italic', 'strikethrough', 'subscript', 'superscript', '|',
            'alignment', '|',
            'bulletedList', 'numberedList', 'todoList', 'Outdent', 'Indent', '|',
            'link', 'ImageInsert', 'MediaEmbed', '|',
            'insertTable', '|',
            'blockQuote', 'codeblock', '|',
            'undo', 'redo',
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
    table: {
        contentToolbar: [
            'tableColumn', 'tableRow', 'mergeTableCells',
            'tableProperties', 'tableCellProperties'
        ],

        // Configuration of the TableProperties plugin.
        tableProperties: {
            // ...
        },

        // Configuration of the TableCellProperties plugin.
        tableCellProperties: {
            // ...
        }
    },
    // This value must be kept in sync with the language defined in webpack.config.js.
    language: 'jp',
};

export {ClassicEditor, MyUploaderAdaptor}