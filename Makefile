# Development

sass:
	sass --watch public/sass:public/css

update:
	git checkout master
	git pull



# Build process

build.js:
	sed -i '' 's@lib/require.js@build/out.js@' public/index.html
	node public/js/build/r -o public/js/build/app.build.js

build.css:
	sass --update public/sass/:public/css/ --style compressed

build: build.js build.css



# Deploys

build.commit:
	git add public/js/build/out.js
	git add -f public/css/home.css public/css/landing.css public/css/profile.css
	git commit -m "Added JS & CSS compiled files"

build.commit.revert:
	git reset --hard HEAD^


# ALPHA

alpha.update:
	git checkout alpha
	git pull origin alpha

alpha.push: build build.commit
	git push -f alpha alpha:master

alpha: alpha.update alpha.push build.commit.revert
	git checkout master

alpha.test.push: build build.commit
	git push -f test-alpha alpha:master

alpha.test: update.alpha alpha.test.push build.commit.revert
	git checkout master



# BETA

beta.update:
	git checkout beta
	git pull origin beta

beta.push: build build.commit
	git push -f beta beta:master

beta: beta.update beta.push build.commit.revert
	git checkout master

beta.test.push: build build.commit
	git push -f test-beta beta:master

beta.test: update.beta beta.test.push build.commit.revert
	git checkout master
