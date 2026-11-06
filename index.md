---
layout: page
permalink: /
---

<h1>about this site</h1>

The site's design is inspired by [Xah Lee's website](http://xahlee.info/) and was implemented
with the help of `ChatGPT`, an AI model by `OpenAI`

The site's emblems are inspired by *DuckTales* (1987), season 1, episode 8:
“Where No Duck Has Gone Before”. A visit to a sci-fi TV set sends Launchpad
and the kids into real outer space, where they encounter the slimy alien
overlord Bulovan

- **Repo**: [github.com/laserattack/laserattack.github.io](https://github.com/laserattack/laserattack.github.io)
- **Last post**: [{{ site.posts.first.title }}]({{ site.posts.first.url | remove: '/index.html' }}) (`{{ site.posts.first.date | date: "%Y-%m-%d" }}`)
- **Total**: {{ site.posts.size }} posts (`{{ site.posts.last.date | date: "%Y-%m" }} - {{ site.posts.first.date | date: "%Y-%m" }}`) in {{ site.categories.size }} [categories](/categories/)
{% for count in (1..site.posts.size) reversed %}{% for category in site.categories %}{% if category[1].size == count %}  - [{{ category[0] }}](/categories/{{ category[0] }}/): {{ category[1].size }}
{% endif %}{% endfor %}{% endfor %}

<h1>about me</h1>

- **Nicknames**: `serr`, `laserattack`
- **GitHub**: [github.com/laserattack](https://github.com/laserattack)
- **Mastodon**: [mastodon.ml/@serr](https://mastodon.ml/@serr)
- **XMPP**: [laserattack@0nl1ne.at](xmpp:laserattack@0nl1ne.at)
- **MAIL**: [laserattack@cock.li](mailto:laserattack@cock.li)
- **PGP**:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEaoA+YRYJKwYBBAHaRw8BAQdALcylHsJhiaiG/1Z/6L6kZeABo/rgYX9TVj2i
VpTReeC0E1ByaW1hcnkgS2V5IChDbGVhbimIkwQTFgoAOxYhBAxz5kj+6kZej2ST
rziiLqCGhkyPBQJqgD5hAhsDBQsJCAcCAiICBhUKCQgLAgQWAgMBAh4HAheAAAoJ
EDiiLqCGhkyPpuQA/2EhSFGG7YaLp1LINKNdH+kO0PNlseaQ3bE/8LQz5apJAP9F
qs5giukGNFW1WsDa2xFwGxV9dlHr3UgFF9B2YiOOBbg4BGqASZ4SCisGAQQBl1UB
BQEBB0CqHGu4KplCJul4FHH3mrh3nDVrWKXdhYCc3NpeQzL3dAMBCAeIfgQYFgoA
JhYhBAxz5kj+6kZej2STrziiLqCGhkyPBQJqgEmeAhsMBQkB4TOAAAoJEDiiLqCG
hkyPGUwA/jRI1/FCbw5ewLNd81KeaVCxOyQjQ2AN2maMOiKPSESmAP495K4crObv
3NaW48Myq3HHXHgttH2rBTOQmhHvuoROAbgzBGqATHUWCSsGAQQB2kcPAQEHQLDu
Vae20rXvJDEHZUqKjUYJ7837SFL2HG5O2xNa4XUEiPUEGBYKACYFCQHhM4AWIQQM
c+ZI/upGXo9kk684oi6ghoZMjwUCaoBNogIbIACBdiAEGRYKAB0WIQRB0v4ZIcMD
zXRqWx58tK8WI+v9DQUCaoBMdQAKCRB8tK8WI+v9DUJPAP4q0SEChxjHad+se78f
JUUPAsVXDiJP0oyXMjg2KMswUQEAsrj+cKEf0FZEp7A2c6Y5lRQan3o7BWfe9UbY
X/QjOQoJEDiiLqCGhkyPA5gBALvzO+U+otN5+MaUaP6uAWmmnvyJgUYJH8pC+4Td
eoM4AP43ijjzxlViwpBpd7t4NqYr205j3kHH6hvqpFNQk9g9AbgzBGqAUlgWCSsG
AQQB2kcPAQEHQOxTz0Y5CxSKuxK5Amcv6gCfb6DVbzvQDGG+pczDHqS1iPUEGBYK
ACYWIQQMc+ZI/upGXo9kk684oi6ghoZMjwUCaoBSWAIbAgUJAeEzgACBCRA4oi6g
hoZMj3YgBBkWCgAdFiEEowAY9aL3SZ8UdFcuHMJxtgfhenMFAmqAUlgACgkQHMJx
tgfhenMF/AEA/KJbWBOt/NQXeFXmBnqJ+G0/bAlbSSKjlTCGbmee088BAKN2hdCw
zSISFJ37A34VNzNeEbHfjXdyitrlHa8BqXEJ6uoA/isP/B1XE4U0U8+1NA4K1V6t
JLK/Jcgjlp3fy2EnxU19AP9wTn1uwrFackH+ODlKX6JQkMYDfgwakdxmHNfm55RS
DA==
=TLTG
-----END PGP PUBLIC KEY BLOCK-----
```
