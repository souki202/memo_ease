git checkout staging
git pull
cd memo-ease
call sam build --config-env develop --use-container
call sam deploy --config-env develop
cd ..