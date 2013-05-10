build:
	sed -i '' 's@lib/require.js@build/out.js@' public/index.html
	node public/js/build/r -o public/js/build/app.build.js

update.repo:
	git checkout public/index.html
	git pull origin master

update: update.repo build

deploy-test:
	git co -b test-deploy
	git add public/index.html
	git add public/js/build/out.js
	git commit -m "Test bundle ready for deployment"
	git push -f test test-deploy:master
	git co master
	git br -D test-deploy

test: update deploy-test

deploy-alpha:
	git co -b alpha-deploy
	git add public/index.html
	git add public/js/build/out.js
	git commit -m "Alpha bundle ready for deployment"
	git push -f alpha alpha-deploy:master
	git co master
	git br -D test-alpha

alpha: update deploy-alpha
