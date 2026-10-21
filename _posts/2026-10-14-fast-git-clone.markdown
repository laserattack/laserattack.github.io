---
layout: default
title: Быстрый git clone только нужных файлов/папок
category: it
---

- NAME: Быстрый git clone только нужных файлов/папок
- TAGS: it, git, guide

# Проблема

Репозиторий содержит жирный бинарник (`coomer.gif`, десятки МБ),
который тянется при обычном `git clone` и нужен только для красоты в
`README.md`. Но я хочу скачать только код и мейкфайл

# Решение

- `--filter=blob:none` - сервер отдаёт только коммиты и деревья (имена
  файлов), но НЕ содержимое файлов (блобы).
- `--no-checkout` - не разворачивать рабочее дерево после клона, иначе
  git сразу полезет докачивать все блобы (включая гифку).
- `--depth=1` можно добавить, если не нужна история - будет ещё
  быстрее.

```
~/projects/temp
[serr@lap]-> git clone --filter=blob:none --no-checkout https://github.com/Mr-Emacs/coomer
Cloning into 'coomer'...
remote: Enumerating objects: 75, done.
remote: Counting objects: 100% (60/60), done.
remote: Compressing objects: 100% (50/50), done.
remote: Total 75 (delta 14), reused 50 (delta 7), pack-reused 15 (from 1)
Receiving objects: 100% (75/75), 51.38 KiB | 125.00 KiB/s, done.
Resolving deltas: 100% (18/18), done.
```

- `git ls-tree -r --name-only HEAD` - показывает плоский список всех
  файлов в текущем коммите, без выкачивания содержимого. Нужно, чтобы
  понять, какие пути вообще есть и что тянуть.

```
~/projects/temp
[serr@lap]-> cd coomer/
~/projects/temp/coomer
[serr@lap]-> git ls-tree -r --name-only HEAD
.gitignore
LICENSE
Makefile
README.md
coomer.1.gz
coomer.gif
src/cm_gl.h
src/cm_main.c
src/cm_shaders.h
src/stb_image_write.h
```

- `git restore --source=HEAD -- <пути>` - вытаскивает указанные пути
  из коммита `HEAD` в рабочее дерево.

```
~/projects/temp/coomer
[serr@lap]-> git restore --source=HEAD -- src Makefile
remote: Enumerating objects: 1, done.
remote: Counting objects: 100% (1/1), done.
remote: Total 1 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
Receiving objects: 100% (1/1), 585 bytes | 585.00 KiB/s, done.
remote: Enumerating objects: 1, done.
remote: Counting objects: 100% (1/1), done.
remote: Total 1 (delta 0), reused 1 (delta 0), pack-reused 0 (from 0)
Receiving objects: 100% (1/1), 913 bytes | 913.00 KiB/s, done.
remote: Enumerating objects: 1, done.
remote: Counting objects: 100% (1/1), done.
remote: Total 1 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
Receiving objects: 100% (1/1), 7.37 KiB | 7.37 MiB/s, done.
remote: Enumerating objects: 1, done.
remote: Total 1 (delta 0), reused 0 (delta 0), pack-reused 1 (from 1)
Receiving objects: 100% (1/1), 601 bytes | 601.00 KiB/s, done.
remote: Enumerating objects: 1, done.
remote: Counting objects: 100% (1/1), done.
remote: Total 1 (delta 0), reused 1 (delta 0), pack-reused 0 (from 0)
Receiving objects: 100% (1/1), 19.91 KiB | 19.91 MiB/s, done.
```
