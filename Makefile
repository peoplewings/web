# Build process
build.js:
	sed -i '' 's@lib/require.js@build/out.js@' public/index.html
	node public/js/build/r -o public/js/build/app.build.js

build.css:
	sass --update public/sass/:public/css/ --style compressed

build: build.js build.css

add.build:
	git add public
	git commit -m "Added JS & CSS compiled files"

revert.build:
	git reset --soft HEAD^

# Update commands
update.repo:
	git co master
	git checkout public/index.html
	git pull origin master

update.alpha:
	git co alpha
	git checkout public/index.html
	git pull origin alpha

update: update.repo build

#Alpha staging and production deploys
prepare.alpha: update.alpha build add.build 

deploy.test.alpha:
	git push -f test-alpha alpha:master

test.alpha: prepare.alpha
	git push -f test-alpha alpha:master

alpha: prepare.alpha
	git push -f alpha alpha:master

#Beta staging and production deploys
prepare.beta: update.repo build add.build 

deploy.test.beta:
	git push -f test-beta master

test.beta: prepare.beta
	git push -f test-beta master

beta: prepare.beta
	git push -f beta master