### TASKS WITH DOT "." ARE INTERNAL

# Development

sass:
	sass --update public/sass:public/css

sass-watch:
	sass --watch public/sass:public/css

update:
	git stash
	git checkout master
	git pull
	git pull origin master

add-repos:
	-git remote remove origin
	-git remote remove bitbucket
	-git remote remove test
	-git remote remove alpha
	-git remote remove beta
	git remote add origin git@github.com:peoplewings/web.git
	git remote add bitbucket git@bitbucket.org:peoplewings/peoplewings-frontend.git
	git remote add test git@heroku.com:peoplewings-test.git
	git remote add alpha git@heroku.com:peoplewings-alpha.git
	git remote add beta git@heroku.com:peoplewings-beta.git



# Build process

build.js:
	sed -i '' 's@lib/require.js@build/out.js@' public/index.html
	node public/js/build/r -o public/js/build/app.build.js

build.css:
	sass --update public/sass/:public/css/ --style compressed

build: build.js build.css



# Deploys

build.commit: build
	git add public/index.html
	git add public/js/build/out.js
	git add -f public/css/home.css public/css/landing.css public/css/profile.css
	git commit -m "[BUILD] Added JS & CSS compiled files"

build.commit.revert:
	git reset --hard HEAD^
	git checkout master

stash:
	git stash



# TEST

test.push: build.commit
	git push -f test HEAD:master

test: stash test.push
	git reset --hard HEAD^



# ALPHA

alpha.push: build.commit
	git push -f alpha HEAD:master

alpha: stash alpha.push build.commit.revert



# BETA

beta.push: build.commit
	git push -f beta HEAD:master

beta: stash beta.push build.commit.revert
