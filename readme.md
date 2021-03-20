# 開発周り

大体md-memoと同じ

## 各種URL

dev: <https://dev-memo-ease.tori-blog.net/>, <https://api.dev-memo-ease.tori-blog.net/>, <https://fileapi.dev-memo-ease.tori-blog.net/>

stg: <https://stg-memo-ease.tori-blog.net/>, <https://api.stg-memo-ease.tori-blog.net/>, <https://fileapi.stg-memo-ease.tori-blog.net/>

prod: <https://memo-ease.com/>, <https://api.memo-ease.com/>, <https://fileapi.memo-ease.com/>

## ローカル環境

### ドメイン

`dev-memo-ease.tori-blog.net`

`C:\Windows\System32\drivers\etc\hosts`に`127.0.0.1 dev-memo-ease.tori-blog.net`を追加

### dynamodb

テーブル作成

`aws dynamodb create-table --cli-input-json "file://D:\Projects\memo_ease\memo-ease\task\local\memoAliases.json"`

`aws dynamodb create-table --cli-input-json "file://D:\Projects\memo_ease\memo-ease\task\staging\password_reset.json"`

`aws dynamodb create-table --cli-input-json "file://D:\Projects\memo_ease\memo-ease\task\production\create_histories.json"`

### lambdaのテスト

requirements.txtから全然よしなにしてくれないので, 普通にdeployして叩く

アドレスは`https://api.dev-memo-ease.tori-blog.net`
アップしたファイルは`https://fileapi.dev-memo-ease.tori-blog.net` で.

↓ 残骸

`sam local invoke "DeleteMemoFunction" -e events/post.json --config-env develop -n env/env.json`

### apiの開始(残骸)

`sam build --config-env staging`

`sam local start-api -t template.yaml`

## デプロイ

本当はActionsとCodeBuildでなんとかしたかったけどディレクトリ構造が悪かったりで手抜き

各環境の`deploy_{env}.bat`を本プロジェクトのルートをカレントディレクトリにしてWindows上で実行

productionのみ, deploy後に自動的にstagingブランチに戻る

### prodデプロイ時チェック

DynamoDBへの追加

* テーブル追加
* GSI追加, 変更
  * 変更時は, 新しく作成してから消す

## その他

### dynamodb

予約語一覧

<https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/ReservedWords.html>

### axios

各メソッド別の引数

<https://qiita.com/terufumi1122/items/670b1008956428a8cc8c>

### cookie

<https://pizzamanz.net/web/javascript/js-cookie/>

### vue

* vue-multiselect
  * <https://vue-multiselect.js.org>
