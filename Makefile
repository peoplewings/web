build:
	sed -i '' 's@lib/require.js@build/out.js@' public/index.html
	node public/js/build/r -o public/js/build/app.build.js

update.repo:
	git checkout public/index.html
	git pull origin master

update: update.repo build
