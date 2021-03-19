# 開発周り

大体md-memoと同じ

## 各種URL

<https://dev-memo-ease.tori-blog.net/>

<https://stg-memo-ease.tori-blog.net/>

<https://memo-ease.com/>

## ローカル環境

### ドメイン

`dev-memo-ease.tori-blog.net`

`C:\Windows\System32\drivers\etc\hosts`に`127.0.0.1 dev-memo-ease.tori-blog.net`を追加

### dynamodb

テーブル作成

`aws dynamodb create-table --cli-input-json "file://D:\Projects\memo_ease\memo-ease\task\local\memoAliases.json"`

`aws dynamodb create-table --cli-input-json "file://D:\Projects\memo_ease\memo-ease\task\staging\memos.json"`

### lambdaのテスト

`sam local invoke "DeleteMemoFunction" -e events/post.json --config-env develop -n env/env.json`

`sam local invoke "GetFileFunction" -e events/post.json --config-env develop -n env/env.json -t file_api_template.yaml --config-file file_api_samconfig.toml -b .aws-sam-file-api/build`

### apiの開始

`sam build --config-env staging`

`sam local start-api -t template.yaml`

## デプロイ

本当はActionsとCodeBuildでなんとかしたかったけどディレクトリ構造が悪かったりで手抜き

### dev

requiementsの変更があればwslに入って

```shell
cd /mnt/d/Projects/memo_ease/memo-ease/my_layer
pip3 install -r requirements.txt -t ../my_layer_libs/python
```

`sam build --config-env develop --use-container`

`sam deploy --config-env develop`

### staging

`sam build --config-env staging --use-container`

`sam deploy --config-env staging`

### production

`sam build --config-env production --use-container`

`sam deploy --config-env production`

#### prodデプロイ時チェック

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
