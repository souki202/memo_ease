export default {
    en: {
        messages: {
            createError: 'Either the maximum number of creations per user in a given time period has been reached, or an internal error has occurred.',
            notFoundMemo: 'Couldn\'t find the memo.',
            failedToFindMemo: 'Failed to retrieve memo.',
        },
        url: {
            tos: '/en-US/terms_of_service.html',
            privacy: '/en-US/privacy_policy.html'
        },
        index: {
            title: 'MemoEase - No registration required',
            header: 'Memo app without registration.',
            description: {
                one: 'This is a web application that allows you to create your own memos with just one button.',
                two: 'You can also set a password for safe use.',
            },
            policy: [
                'By using Create or Edit Memo, you agree to the ',
                'Terms of Use',
                ' and ',
                'Privacy Policy',
                '.'
            ],
            newMemo: 'New Memo',
            editMemo: 'Edit Memo',
            memoId: 'Memo ID',
            history: 'History (saved per browser)',

            ogp: {
                title: 'MemoEase - No registration required',
                siteName: 'MemoEase - No registration required',
                description: 'MemoEase is a web service memo application that can be used without registration. You can create your own memos with just one button, upload images, and set passwords. There is also a history function, so you can easily access the memos you have used. You can also freely publish memos that you want everyone to see!',
                locale: 'en_US',
            }
        },
        header: {
            home: 'Home',
            contact: 'Contact',
            create: 'New Memo',
        },
        feedback: {
            title: 'MemoEase - Contact Us and Feedback Form',
            header: 'Contact Us and Feedback Form',
            feedbackTitle: 'Title',
            email: 'Email',
            body: 'Body (Required)',
            annotation: 'Please note that replies will be limited to questions. Please understand in advance.',
            complete: 'Sending completed.',
            failed: 'Failed to send your inquiry.',
            submit: 'Submit',
        },
        edit: {
            notSet: '',

            saveUrl: {
                title: 'Bookmark your note!',
                desc1: 'The memo ID is used when you enter the edit screen from the top page. You can change the ID at any time from the left sidebar.',
                desc2: 'Notes will be automatically saved a few seconds after the last edit.',
                memoUrl: 'Memo URL',
                memoId: 'Memo ID',
            },
            password: {
                title: 'Password required.',
                desc: 'Enter your password to edit.',
                label: 'Password',
                submit: 'Submit',
                forgot: 'Forgot your password?',
                reset: 'The reset email has been sent.',
                wrongPassword: 'Either the password is wrong or the memo was not found.',
                failedToSendReset: 'Failed to send reset email. Your email address may not be set.',
            },
            getServerError: 'A server error has occurred.',
            notFound: 'Memo not found.',
            getError: 'An unknown error has occurred.',

            form: {
                titleMaximum: 'The title should be no more than 1000 characters.',
                bodyMaximum: 'The body should be no more than 4MB.',
                success: 'Saved.',
                failed: 'Failed to save memo.',
            },

            sidebar: {
                memoId: {
                    title: 'Memo ID',
                    header: 'Memo ID setting',
                    warning: 'Note: If no password is set, anyone with an ID can edit the file.',
                    label: 'Memo ID',
                    update: 'Update',

                    notInput: 'Enter your memo ID',
                    maximum: 'Memo IDs can be up to 1000 characters long.',
                    success: 'Memo ID updated.',
                    duplicate: 'That memo ID has already been registered.',
                },
                password: {
                    title: 'Password',
                    header: 'Password setting',
                    note: 'If you leave the new password blank, you can change it to no password.',
                    current: 'Current',
                    new1: 'New password',
                    new2: 'New password(Confirm)',
                    resetEmail: 'Reset Email',
                    update: 'Update',

                    wrong: 'Password input does not match',
                    maximum: 'The password and email can be up to 1000 characters long.',
                    success: 'Password and Email settings updated.',
                    failed: 'Failed to update password and email settings.',
                },
                share: {
                    title: 'Shared link',
                    header: 'Shared link',
                    note: 'Generates a read-only shared link. No password is required to view it.',
                    url: 'Shared Url',
                    embed: 'Embedded code',
                    getLink: 'Get link!',
                    stop: 'Stop sharing',
                    failed: 'Failed to change sharing settings.',
                },
                links: {
                    home: 'Top',
                    feedback: 'Feedback',
                    tos: 'Terms of Service',
                    privacy: 'Privacy Policy',
                }
            },
        },
        resetPassword: {
            userError: 'Failed to reset the password. The URL may have expired.',
            serverError: 'Server error has occurred.',
            unknownError: 'Unknown error has occurred.',
        }
    },
    ja: {
        messages: {
            createError: 'ユーザごとの一定時間内に作成できる上限に達したか, 内部エラーが発生しました.',
            notFoundMemo: 'メモが見つかりませんでした',
            failedToFindMemo: 'メモの検索に失敗しました',
        },
        url: {
            tos: '/terms_of_service.html',
            privacy: '/privacy_policy.html'
        },
        index: {
            title: '登録不要なWebメモアプリ Memo Ease',
            header: '登録不要型のメモアプリ',
            description: {
                one: '1ボタンで自分だけのメモを作成できるWebアプリです。',
                two: 'パスワードも設定でき、安全に使えます。',
            },
            policy: [
                'メモの作成及び編集をご利用になる場合, ',
                '利用規約',
                ' 及び ',
                'プライバシーポリシー',
                'に同意したものとみなします。',
            ],
            newMemo: 'メモを新規作成',
            editMemo: 'メモを編集',
            memoId: 'メモID',
            history: '履歴 (ブラウザごとに保存)',

            ogp: {
                title: '登録不要なWebメモアプリ Memo Ease',
                siteName: '登録不要なWebメモアプリ Memo Ease',
                description: '登録不要で利用できるWebサービスのメモアプリ MemoEase. 1ボタンで自分だけのメモを作成でき, 画像のアップロードやパスワードの設定もできます. 履歴機能もあるので, 利用したメモにかんたんにアクセスできます. みんなに見てほしいメモは自由に公開も可能!',
                locale: 'ja_JP',
            }
        },
        header: {
            home: 'ホーム',
            contact: 'お問合せ',
            create: 'メモを新規作成',
        },
        feedback: {
            title: 'お問合せ 兼 フィードバックフォーム MemoEase',
            header: 'お問合せ 兼 フィードバックフォーム',
            feedbackTitle: '件名',
            email: 'Email',
            body: '本文(必須)',
            annotation: '返信はご質問等に限定しております. あらかじめご了承ください.',
            complete: '送信が完了しました',
            failed: 'お問合せの送信に失敗しました.',
            submit: '送信',
        },
        edit: {
            notSet: 'メモIDが設定されていません',
            saveUrl: {
                title: 'メモをブックマークに登録しましょう!',
                desc1: 'メモIDは, トップページから編集画面に入るときに使用します. IDは左のサイドバーからいつでも変更できます.',
                desc2: 'メモは, 最後の編集から数秒後に自動で保存されます.',
                memoUrl: 'メモのURL',
                memoId: 'メモID',
            },
            password: {
                title: 'パスワード入力',
                desc: 'このメモを編集するには, パスワードでの認証が必要です.',
                label: 'パスワード',
                submit: '送信',
                forgot: 'パスワードを忘れた場合, ここをクリックでリセットできます.',
                reset: 'リセット用メールを送信しました.',
                wrongPassword: 'パスワードが違うか, メモが見つかりませんでした.',
                failedToSendReset: 'リセット用メールの送信に失敗しました. メールアドレスが設定されていない可能性があります.',
            },
            getServerError: 'サーバーエラーが発生しました',
            notFound: 'メモが見つかりませんでした.',
            getError: '不明なエラーが発生しました.',

            form: {
                titleMaximum: 'タイトルは1000文字以内です.',
                bodyMaximum: '本文は4MB以内です.',
                success: 'メモを保存しました',
                failed: 'メモの保存に失敗しました',
            },
    
            sidebar: {
                memoId: {
                    title: 'メモID設定',
                    header: 'メモID設定',
                    warning: '注意: パスワードが設定されていない場合, IDがわかれば誰でも編集できます.',
                    label: 'メモID',
                    update: '更新',

                    notInput: 'メモIDを入力してください',
                    maximum: 'メモIDの文字数は1000文字までです',
                    success: 'メモIDを更新しました',
                    duplicate: 'そのメモIDは既に登録されています',
                },
                password: {
                    title: 'パスワード設定',
                    header: 'パスワード設定',
                    note: '新しいパスワードを空欄にして更新すると, パスワード無しにできます.',
                    current: '現在のパスワード',
                    new1: '新しいパスワード',
                    new2: '新しいパスワード(確認用)',
                    resetEmail: '再設定用Email',
                    update: '更新',

                    wrong: 'パスワードの入力が一致しません',
                    maximum: 'パスワードとEmailの文字数は1000文字までです',
                    success: 'パスワードとEmail設定を更新しました',
                    failed: 'パスワードとEmail設定の更新に失敗しました',
                },
                share: {
                    title: '共有リンク',
                    header: '共有リンク',
                    note: '閲覧専用の共有リンクを生成します. 閲覧時はパスワード不要です.',
                    url: 'メモのURL',
                    embed: '埋め込みコード',
                    getLink: 'リンクを取得',
                    stop: '共有を停止',
                    failed: '共有設定の変更に失敗しました',
                },
                links: {
                    home: 'トップページ',
                    feedback: 'フィードバック',
                    tos: '利用規約',
                    privacy: 'プライバシーポリシー',
                }
            },
        },
        resetPassword: {
            userError: 'パスワードのリセットに失敗しました. URLの有効期限が切れている可能性があります.',
            serverError: 'サーバーエラが発生しました',
            unknownError: '不明なエラーが発生しました',
        },
    },
}