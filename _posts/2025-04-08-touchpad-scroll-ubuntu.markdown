---
layout: post
title: плавный скролл тачпада в Ubuntu и Firefox
categories: [it, linux]
---

На Убунте настраивал тачпадный скролл, чтобы работало плавно и хорошо,
закину сюда настройки, которые мне помогли.

В `~/.profile` добавил:

```sh
xinput set-prop <ид тачпада из xinput list> "libinput Scrolling Pixel Distance" 50
```

Firefox `about:config`:

```text
mousewheel.system_scroll_override.enabled -> false
general.smoothScroll -> true
general.smoothScroll.msdPhysics -> true
mousewheel.default.delta_multiplier_y -> 100
mousewheel.min_line_scroll_amount -> 0
apz.gtk.kinetic_scroll.enabled -> false
```
