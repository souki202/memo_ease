git checkout master
git pull
call npm run build
cd memo-ease
call sam build --config-env production --use-container
call sam deploy --config-env production
cd ..
aws s3 sync ./web/dst s3://memo-ease.com --delete
aws cloudfront create-invalidation --distribution-id E22XNYWXBJT4QW --paths "/*"
git checkout staging
