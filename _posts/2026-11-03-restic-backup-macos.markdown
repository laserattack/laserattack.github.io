---
layout: post
title: бэкапы macOS с restic — конфиги, исключения и восстановление
categories: [macos, it]
---

> пост сгенерирован ии по моему логу установки и тд, я чуть чуть поредактировал

# Как устроен мой бэкап

Использую restic: он сохраняет версии файлов в зашифрованный
репозиторий. Каждая резервная копия представлена снапшотом, а одинаковые
блоки данных не нужно хранить заново для каждого снимка.

Моя схема такая:

```text
файлы Mac → локальный репозиторий restic
                       ├─ копия на внешний диск KINGSTON
                       └─ копия на сервер по SSH
```

Репозиторий на том же диске удобен для быстрого доступа к прошлым
версиям, но от потери самого диска спасают внешние копии. Пока выполнен
только локальный backup, копии на других носителях сами не обновятся.

# Установка и расположение файлов

Установка через Homebrew:

```sh
brew install restic
```

Рабочая папка у меня находится в `~/restic-backup`:

```text
restic-backup/
├── config/
│   ├── backup.sh
│   ├── include_paths.txt
│   └── exclude_paths.txt
├── repo/
└── mnt/
```

`repo` — зашифрованный репозиторий, `config` — скрипт и списки путей,
`mnt` — точка монтирования для просмотра сохранённых файлов.

При настройке с нуля репозиторий создаётся один раз:

```sh
mkdir -p ~/restic-backup/config ~/restic-backup/mnt
restic -r ~/restic-backup/repo init
```

Restic попросит задать пароль. Его нужно сохранить: без пароля
восстановить данные из репозитория не получится. В моём скрипте
пароль не записан, restic запрашивает его интерактивно.

# Какие пути сохраняю

Ниже содержимое моего `include_paths.txt`:

```console
$ cat ~/restic-backup/config/include_paths.txt
/Users/serr
/opt/homebrew/etc
/opt/homebrew/var
/Library/LaunchDaemons
/Library/LaunchAgents
```

Здесь домашний каталог, настройки и данные Homebrew, а также системные
LaunchAgents и LaunchDaemons. Это список исходных путей для
`--files-from`.

Домашняя папка включает скрытые файлы, `.ssh`, `.gnupg`, проекты и
`Library`, кроме явно исключённых путей. Символические ссылки
сохраняются как ссылки.

# Что исключаю

Фактическое содержимое `exclude_paths.txt`:

```console
$ cat ~/restic-backup/config/exclude_paths.txt
#
/Users/serr/restic-backup
/Users/serr/mnt
/Users/serr/.cache
/Users/serr/.codex
/Users/serr/.colima
/Users/serr/Downloads/torrent

#
/Users/serr/Library/Caches
/Users/serr/Library/Logs
/Users/serr/Library/Metadata

# Development
**/node_modules
**/.next
**/.nuxt
**/.turbo
**/__pycache__
**/.pytest_cache
**/.mypy_cache
**/.ruff_cache
**/.venv
**/.gradle

# macOS metadata
**/.DS_Store

# Temporary files
**/*.tmp
**/*.swp
**/*~
```

Сам `restic-backup` исключён, чтобы не сохранять репозиторий внутрь
него самого. Точка монтирования внутри этой папки тоже исключена.
Отдельный `/Users/serr/mnt` — другой путь, который я также не сохраняю.

Кэши, логи, виртуальные окружения и результаты сборок обычно можно
создать заново. Но исключения — осознанная потеря части данных:
например, `.colima` может содержать диски виртуальных машин и данные
контейнеров. Если там есть нужная база данных, для неё потребуется
отдельный бэкап. То же относится к нужным данным в `.codex`.

Правила применяются к новым снапшотам. Уже сохранённые файлы из старых
снимков от редактирования списка исключений не исчезнут.
Подробности синтаксиса — в
[документации restic](https://restic.readthedocs.io/en/stable/040_backup.html).

# Команда backup в моём скрипте

Основные переменные `backup.sh`:

```bash
BACKUP_USER="serr"
USER_HOME="/Users/${BACKUP_USER}"
REPO_DIR="${USER_HOME}/restic-backup"
REPO_PATH="${REPO_DIR}/repo"
CACHE_DIR="${USER_HOME}/.cache/restic"
export RESTIC_CACHE_DIR="$CACHE_DIR"
```

Скрипт проверяет наличие репозитория, переходит в `REPO_DIR` и для
операции `backup` перезапускает себя через `sudo`. Это даёт доступ к
файлам разных владельцев, но не отменяет ограничений приватности macOS.
При ошибках доступа нужно проверить разрешение Full Disk Access для
приложения, из которого выполняется бэкап.

Сама команда из скрипта:

```bash
restic backup \
    --repo "$REPO_PATH" \
    --files-from "$REPO_DIR/config/include_paths.txt" \
    --exclude-file "$REPO_DIR/config/exclude_paths.txt" \
    --verbose
```

Запускаю её так:

```sh
~/restic-backup/config/backup.sh backup
```

В скрипте включён `set -e`: если команда завершается с ошибкой,
выполнение прерывается. После успешного backup запускается очистка
истории. В конце привилегированной операции обработчик `trap`
возвращает владельца рабочей папки и кэша пользователю `serr`.

# Сколько версий храню

```bash
restic --repo "$REPO_PATH" forget \
    --keep-last 14 \
    --keep-daily 14 \
    --keep-weekly 8 \
    --keep-monthly 12 \
    --keep-yearly 5 \
    --prune \
    --verbose
```

Сохраняются последние 14 снимков, а также снимки за последние 14 дней,
8 недель, 12 месяцев и 5 лет, в которых есть бэкапы. Правила объединяются:
один снимок может удовлетворять нескольким условиям.

`forget` удаляет ненужные записи о снапшотах, `prune` освобождает место
от данных, на которые больше не ссылаются оставшиеся снимки.
Перед изменением политики полезно выполнить ту же команду с
`--dry-run` и посмотреть, какие снимки будут удалены.
[Описание политики хранения](https://restic.readthedocs.io/en/stable/060_forget.html).

# Копирование на внешний диск и сервер

Для внешнего диска в скрипте задан путь:

```bash
TARGETS_LOCAL=(
    "/Volumes/KINGSTON/restic-backup-mac"
)
```

Запуск:

```sh
~/restic-backup/config/backup.sh sync-to-local
~/restic-backup/config/backup.sh sync-to-remote
```

Это два отдельных действия. Скрипт не вызывает их автоматически после
`backup`. Для внешнего диска он сначала проверяет, что том смонтирован
и целевой каталог существует.

Копируется вся рабочая папка вместе с конфигами и репозиторием.
Для локальной копии используется:

```bash
rsync -av --delete \
    --no-owner --no-group \
    --exclude='/mnt/*' \
    "$REPO_DIR/" "$DEST/"
```

Для сервера — та же схема, но транспортом выступает SSH:

```bash
rsync -av --delete \
    --exclude='/mnt/*' \
    -e "ssh -p $PORT" \
    "$REPO_DIR/" "$USER_HOST:$REMOTE_PATH/"
```

Адрес сервера здесь не публикую. В конфиге он задаётся в формате
`user@host:port:remote_path`.

В этих командах `/mnt/*` — **правило rsync**, привязанное к корню
передаваемой папки. Оно исключает содержимое `restic-backup/mnt`,
чтобы не копировать расшифрованные файлы смонтированных снимков.

`--delete` делает копию зеркалом: удалённое из источника удаляется
и на приёмнике.

Синхронизацию выполняю после завершения backup.

# Просмотр бэкапа: ошибка FUSE

Первая попытка смонтировать репозиторий закончилась так. Это реальный
вывод из моей установки:

```console
$ ~/restic-backup/config/backup.sh mount
enter password for repository:
repository 9efc9190 opened (version 2, compression level auto)
[0:00] 100.00%  1 / 1 index files loaded
cannot locate OSXFUSE
```

Пароль подошёл, репозиторий открылся, но для виртуальной файловой
системы не хватало FUSE.

Установил macFUSE:

```sh
brew install --cask macfuse
```

Сокращённый вывод установки:

```text
==> Installing Cask macfuse
installer: Package name is macFUSE
installer: The install was successful.
🍺  macfuse was successfully installed!
```

В моей установке macFUSE 5.5.0 потребовалось разрешить расширение
разработчика Benjamin Fleischer, изменить политику загрузки на Apple
Silicon через Recovery и перезагрузиться. Это описание пройденного
мной пути, а не обязательное требование для любой конфигурации:
у macFUSE есть и FSKit backend для совместимых файловых систем на
macOS 26. Поддержку нужно проверять для конкретной связки программ.
[Сайт macFUSE](https://macfuse.github.io/).

Для обычного `restic restore` FUSE вообще не нужен.

# Успешное монтирование

После настройки получил такой вывод:

```console
$ ~/restic-backup/config/backup.sh mount
enter password for repository:
repository 9efc9190 opened (version 2, compression level auto)
[0:00] 100.00%  1 / 1 index files loaded
Loading snapshots...
Now serving the repository at /Users/serr/restic-backup/mnt
Use another terminal or tool to browse the contents of this folder.
When finished, quit with Ctrl-c here or umount the mountpoint.
```

Терминал остаётся занят, пока restic обслуживает файловую систему.
В другом терминале посмотрел снимки:

```console
$ ls -la ~/restic-backup/mnt/snapshots
 total 32
 dr-xr-xr-x  1 serr  staff   0  1 ноя 20:01 .
 dr-xr-xr-x  1 serr  staff   0  1 ноя 20:01 ..
 dr-xr-xr-x  5 root  wheel   0  1 ноя 19:26 2026-11-01T19:26:43+03:00
 lrwxrwxrwx  1 serr  staff  25  1 ноя 19:26 latest -> 2026-11-01T19:26:43+03:00
```

`latest` указывает на снимок от 1 ноября 2026 года, 19:26:43, UTC+3.
В `snapshots/latest/Users/serr/` я увидел домашний каталог: проекты,
документы, `Library`, скрытые настройки и символические ссылки.
Это подтверждает просмотр дерева снимка, но ещё не чтение всех данных.

После монтирования эту папку можно открыть в Finder, файловом менеджере
или любом приложении, которое умеет работать с обычными файлами и
каталогами. Например, открыть домашний каталог из последнего снимка
в Finder:

```sh
open ~/restic-backup/mnt/snapshots/latest/Users/serr/
```

Дальше можно ходить по папкам, просматривать документы и фотографии,
читать файлы в редакторе и копировать нужное в основную файловую
систему.

Смонтированный бэкап доступен **только для чтения (read-only)**:
изменять, удалять и переименовывать файлы внутри него нельзя.
Поэтому забрать файл в основную файловую систему можно именно
копированием: перемещение с удалением оригинала из снимка не сработает.

Завершить монтирование можно через `Ctrl+C` или так:

```sh
umount ~/restic-backup/mnt
```

# Проверка и восстановление

Следующие команды — план проверки, их успешного вывода в истории
установки пока нет. Их нельзя считать уже выполненным тестом.

Посмотреть список снапшотов без FUSE:

```sh
restic -r ~/restic-backup/repo snapshots
```

Восстановить один файл в отдельную временную папку:

```sh
restore_dir=$(mktemp -d /tmp/restic-restore.XXXXXX)
restic -r ~/restic-backup/repo restore latest \
    --target "$restore_dir" \
    --include '/Users/serr/.gitconfig'

cmp ~/.gitconfig "$restore_dir/Users/serr/.gitconfig" \
    && echo 'OK: файлы идентичны'
```

После завершения остальных операций можно проверить репозиторий:

```sh
restic -r ~/restic-backup/repo check --read-data
```

Эта проверка читает все сохранённые данные и может занять заметное
время. Проверять нужно также копии на внешнем диске и сервере:
работающий локальный репозиторий не гарантирует исправность остальных.
