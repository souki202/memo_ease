git checkout staging
git pull
npm run dev
cd memo-ease
call sam build --config-env staging --use-container
call sam deploy --config-env staging
cd ..
aws s3 sync ./web/dst s3://stg-memo-ease.tori-blog.net --delete
aws cloudfront create-invalidation --distribution-id EWVQGO1B7LR9X --paths "/*"