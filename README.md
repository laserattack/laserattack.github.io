# Setup

```
docker run -d \
  --name jekyll-server \
  --volume="$PWD:/srv/jekyll" \
  --publish 4000:4000 \
  -w /srv/jekyll \
  ruby:3.3 \
  bash -c "bundle install && bundle exec jekyll serve --host 0.0.0.0"
```

http://localhost:4000
