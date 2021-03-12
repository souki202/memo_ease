git checkout staging
git pull
cd lambda
call sam package --template-file template.yaml --output-template-file template-output.yaml --s3-bucket aws-sam-nested-application-packages-memo-ease-stg
call sam deploy --template-file template-output.yaml --stack-name memo-ease-stg --parameter-overrides Env=stg --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND
cd ..
aws s3 sync ./web/dst s3://stg-memo-ease.tori-blog.net --delete
aws cloudfront create-invalidation --distribution-id EWVQGO1B7LR9X --paths "/*"