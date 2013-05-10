build.js:
	sed -i '' 's@lib/require.js@build/out.js@' public/index.html
	node public/js/build/r -o public/js/build/app.build.js

build.css:
	sass --update public/sass/:public/css/ --style compressed

build: build.js build.css

add.build:
	git add public/index.html
	git add public/js/build/out.js
	git commit -m "Added JS built files"
	git add public/css
	git commit -m "Added minfied CSS"

revert.build:
	git reset --soft HEAD^2

update.repo:
	git co master
	git checkout public/index.html
	git pull origin master

update.alpha:
	git co alpha
	git checkout public/index.html
	git pull origin alpha

update: update.repo build

prepare.test.alpha: update.alpha build add.build 

deploy.test.alpha:
	git push -f test-alpha alpha:master

test.alpha: prepare.test.alpha
	git push -f test-alpha alpha:master





deploy-alpha:
	git co -b alpha-deploy
	git add public/index.html
	git add public/js/build/out.js
	git commit -m "Alpha bundle ready for deployment"
	git push -f alpha alpha-deploy:master
	git co master
	git br -D test-alpha

alpha: update deploy-alpha
