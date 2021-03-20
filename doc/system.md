# システム構成

## リソース

API Gateway
Lambda
DynamoDB
S3
Route53
CloudFront
CloudFormation
SES
Certificate Manager

APIの構成はmemo-ease内の`template.yml`参照

外部: SendGrid (独自ドメインでのメールやり取り用)

## ファイルアップロード

CKEditorでMyUploaderAdaptorクラスを実装. ckeditor.js参照

URLは各環境ごとに変わる

1. https://api.memo-ease.com/create_upload_url にファイル情報を送信
   * dev api.dev-memo-ease.tori-blog.net
   * stg api.stg-memo-ease.tori-blog.net
   * LambdaでS3にアップするための署名付きURLを生成して返す
2. 帰ってきたURLを使用してs3にput
3. 1で取得したファイル名を使用してURLを構築してresolve

### 置き場所

s3バケット

* files.memo-ease.com
* files-stg.memo-ease.com
* files-dev.memo-ease.com

### ファイルURL

CloudFront経由

* https://fileapi.dev-memo-ease.tori-blog.net/uploads/{memo_uuid}/{file_key}
* https://fileapi.stg-memo-ease.tori-blog.net/...
* https://fileapi.memo-ease.tori-blog.net/...

## メモ本文

s3バケット. 後で色々確認したら, 画像のバケットと分けなくてよかった

* memo-ease-storage-dev
* memo-ease-storage-stg
* memo-ease-storage-prod

## サイトの静的ファイル群

devはローカル内

* stg-memo-ease.tori-blog.net
* prod-memo-ease.tori-blog.net
