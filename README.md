# Setup

```
docker run \
  --volume="$PWD:/srv/jekyll" \
  --publish 4000:4000 \
  -it jekyll/jekyll \
  jekyll serve --host 0.0.0.0
```
