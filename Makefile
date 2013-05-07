build:
	sed -i '' 's@lib/require.js@build/out.js@' public/index.html
	node public/js/build/r -o public/js/build/app.build.js

update.repo:
	git checkout master
	git checkout public/index.html
	git pull origin master

update: update.repo build

put-s3-files:
	s3cmd put --acl-public --guess-mime-type --recursive public/ s3://test.peoplewings.com/

deploy: update put-s3-files
