### TASKS WITH DOT "." ARE INTERNAL

# Development

sass:
	sass --watch public/sass:public/css

update:
	git stash
	git checkout master
	git pull
	git pull origin master
	git pull bitbucket master
	git push origin master
	git push bitbucket master

add-repos:
	-git remote remove origin
	-git remote remove bitbucket
	-git remote remove alpha
	-git remote remove alpha-test
	-git remote remove beta
	-git remote remove beta-test
	git remote add origin git@github.com:peoplewings/web.git
	git remote add bitbucket git@bitbucket.org:peoplewings/peoplewings-frontend.git
	git remote add alpha git@heroku.com:peoplewings-alpha.git
	git remote add alpha-test git@heroku.com:peoplewings-test.git
	git remote add beta git@heroku.com:peoplewings-beta.git
	git remote add beta-test git@heroku.com:peoplewings-test-beta.git



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
	git checkout master


# ALPHA

alpha-update:
	git stash
	git checkout alpha
	git pull origin alpha
	git pull bitbucket alpha
	git push origin alpha
	git push bitbucket alpha

alpha.push: build build.commit
	ggit push -f alpha alpha:master

alpha: alpha-update alpha.push build.commit.revert

alpha.test.push: build build.commit
	git push -f alpha-test alpha-test:master

alpha-test: alpha-update alpha.test.push build.commit.revert



# BETA

beta-update:
	git stash
	git checkout beta
	git pull origin beta

beta.push: build build.commit
	git push -f beta beta:master

beta: beta-update beta.push build.commit.revert

beta.test.push: build build.commit
	git push -f beta-test beta-test:master

beta-test: beta-update beta.test.push build.commit.revert
