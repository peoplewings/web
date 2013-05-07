build:
	sed -i '' 's@lib/require.js@build/out.js@' public/index.html
	node public/js/build/r -o public/js/build/app.build.js

update.repo:
	git checkout master
	git checkout public/index.html
	git pull origin master

update: update.repo build

put-s3-files:
	sass --update public/sass:public/css
	rm -rf public/sass
	rm -R public/js/{core, models, test, views}
	rm public/js/main.js
	rm public/js/router.js
	s3cmd put --acl-public --guess-mime-type --recursive public/ s3://test.peoplewings.com/
	git checkout -- public/

deploy: update put-s3-files
