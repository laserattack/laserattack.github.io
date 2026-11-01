# Setup

```sh
docker run -d \
  --name jekyll-server \
  --volume="$PWD:/srv/jekyll" \
  --publish 4000:4000 \
  --publish 35729:35729 \
  -w /srv/jekyll \
  ruby:3.3 \
  bash -c "bundle install && bundle exec jekyll serve --host 0.0.0.0 --force_polling --livereload --livereload-port 35729"
```

The first start installs gems, including native extensions, and can take several
minutes. Wait for `Server running...` in the logs before opening the site:

```sh
docker logs -f jekyll-server
```

Open http://localhost:4000 (HTTP, not HTTPS). Changes to posts, layouts, and assets
automatically rebuild the site and refresh the browser.
