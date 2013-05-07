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
	rm -R .sass-cache/
	rm -rf public/sass
	rm -R public/js/core
	rm -R public/js/models
	rm -R public/js/test
	rm -R public/js/views
	rm public/js/main.js
	rm public/js/router.js
	rm public/.jshintignore
	rm public/.jshintrc
	rm public/testem.yml
	rm public/package.json
	s3cmd put --acl-public --guess-mime-type --recursive public/ s3://test.peoplewings.com/
	git checkout -- public/

deploy: update put-s3-files
