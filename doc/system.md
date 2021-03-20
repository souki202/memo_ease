# システム構成

## ファイルアップロード

CKEditorでMyUploaderAdaptorクラスを実装. ckeditor.js参照

URLは各環境ごとに変わる

1. https://api.memo-ease.com/create_upload_url にファイル情報を送信
   * dev api.dev-memo-ease.tori-blog.net
   * stg api.stg-memo-ease.tori-blog.net
2. 帰ってきたURLを使用してs3にput
3. 1で取得したファイル名を使用してURLを構築してresolve

### 置き場所

s3内

* files.memo-ease.com
* files-stg.memo-ease.com
* files-dev.memo-ease.com

### ファイルURL

CloudFront経由

* https://fileapi.dev-memo-ease.tori-blog.net/uploads/{memo_uuid}/{file_key}
* https://fileapi.stg-memo-ease.tori-blog.net/...
* https://fileapi.memo-ease.tori-blog.net/...

## メモ本文

s3内

* memo-ease-storage-dev
* memo-ease-storage-stg
* memo-ease-storage-prod

## サイトの静的ファイル群

devはローカル内

* stg-memo-ease.tori-blog.net
* prod-memo-ease.tori-blog.net
