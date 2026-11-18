---
layout: post
title: изменение размеров изображения используя ffmpeg
categories: [it]
---

например хочу сделать `219924802.jpeg` 100x100 пикселей

```
ffmpeg -i 219924802.jpeg -vf "scale=100:100" -frames:v 1 219924802_100.jpeg
```
