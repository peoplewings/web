build:
	sed -i '' 's@lib/require.js@build/out.js@' public/index.html
	node public/js/build/r -o public/js/build/app.build.js

update.repo:
	git checkout public/index.html
	git pull origin master

update: update.repo build

deploy-test:
	git add public/index.html
	git add public/js/build/out.js
	git commit -m "Test bundle ready for deployment"
	git push test master
	git reset --soft HEAD^
	git reset HEAD public/index.html
	git reset HEAD public/js/build/out.js

test: update deploy-test

deploy-alpha:
	git add public/index.html
	git add public/js/build/out.js
	git commit -m "Alpha bundle ready for deployment"
	git push alpha master
	git reset --soft HEAD^
	git reset HEAD public/js/build/out.js
	git reset HEAD public/index.html

alpha: update deploy-alpha
