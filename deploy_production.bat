git checkout master
git pull
npm run build
cd memo-ease
call sam build --config-env production --use-container
call sam deploy --config-env production
cd ..
aws s3 sync ./web/dst s3://prod-memo-ease.tori-blog.net --delete
aws cloudfront create-invalidation --distribution-id E2KO2XM60TVSA0 --paths "/*"