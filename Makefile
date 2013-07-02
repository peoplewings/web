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
	-git remote remove production
	-git remote remove alpha
	-git remote remove beta
	git remote add origin git@github.com:peoplewings/web.git
	git remote add test git@heroku.com:peoplewings-test.git
	git remote add production git@heroku.com:peoplewings-alpha.git



# Build process

build.js:
	node public/js/build/r -o public/js/build/app.build.js
	sed -i '' 's@lib/require.js@build/out.js@' public/index.html

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

stash:
	git stash

deploy.before: stash

deploy.after: build.commit.revert sass


# Deploy - Test

deploy.test: build.commit
	git push -f test HEAD:master

test: deploy.before deploy.test deploy.after


# Deploy - Production

deploy.production: build.commit
	git push -f production HEAD:master

production: deploy.before deploy.production deploy.after
