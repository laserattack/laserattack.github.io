---
layout: default
title: автозапуск приложений linux
categories: [linux, it]
---

Цель - добавить `syncthing` в автозапуск

бинарь у меня тут

```
~
→ ls ~/software/syncthing-linux-amd64-v2.0.11/syncthing
/home/serr/software/syncthing-linux-amd64-v2.0.11/syncthing
```

в директорию автозапуска

```
~
→ mkdir -p ~/.config/autostart
```

добавил такой вот файлик

```
~/.config/autostart
→ cat syncthing.desktop
[Desktop Entry]
Type=Application
Name=Syncthing
Exec=/home/serr/software/syncthing-linux-amd64-v2.0.11/syncthing
NoDisplay=true
```
