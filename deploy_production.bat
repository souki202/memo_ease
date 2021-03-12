git checkout master
git pull
cd lambda
call sam package --template-file template.yaml --output-template-file template-output.yaml --s3-bucket aws-sam-nested-application-packages-memo-ease-prod
call sam deploy --template-file template-output.yaml --stack-name memo-ease-prod --parameter-overrides Env=prod --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND
cd ..
aws s3 sync ./web/dst s3://prod-memo-ease.tori-blog.net --delete
aws cloudfront create-invalidation --distribution-id E2KO2XM60TVSA0 --paths "/*"