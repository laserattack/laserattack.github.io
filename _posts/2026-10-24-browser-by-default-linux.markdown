---
layout: default
title: установка браузера по умолчанию для открытия ссылок linux
categories: [linux, it]
---

у меня например есть и firefox и chromium, почему то ссылки открывает
chromium. а мне надо чтобы firefox открывал. делаю так

``` console
~/projects/cboomer
[serr@lap]-> xdg-mime default firefox.desktop x-scheme-handler/http x-scheme-handler/https text/html
```
