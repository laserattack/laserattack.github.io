---
layout: default
title: автоматическое выполнение задач по расписанию macos
categories: [macos, it]
---

# Задача

у меня есть скрипт для бэкапов на гитхаб

``` bash
#!/usr/bin/env bash

echo "[INFO  ] Git backup started"

check_result() {
    if [ $? -eq 0 ]; then
        echo "[OK    ] $1"
    else
        echo "[FAILED] $1"
    fi
}

gacp() {
    local repo_name=$1

    git -c user.name="Backup Bot" -c user.email="pi@pis.ka" add .
    check_result "git add $repo_name"

     if git diff --cached --quiet; then
        echo "[INFO  ] No changes to commit in $repo_name"
    else
        git -c user.name="Backup Bot" -c user.email="pi@pis.ka" commit -m "quick update"
        check_result "git commit $repo_name"
    fi

    git push
    check_result "git push $repo_name"
}

# ================ DOTS

echo ""
echo ""

echo "[INFO  ] Processing dotfiles"
cd /Users/serr/projects/dotfiles/ || { echo "  [FAILED] Cannot enter dotfiles directory"; exit 1; }

gacp "dotfiles"

echo ""
echo ""

# ================ MADO

echo ""
echo ""

echo "[INFO  ] Processing MADO"
cd /Users/serr/projects/documents/MADO/ || { echo "  [FAILED] Cannot enter MADO directory"; exit 1; }

gacp "MADO"

echo ""
echo ""

#

echo "[INFO  ] Git backup finished"
```

и я хочу чтобы он выполнялся по расписанию автоматически

# Решение: launchd

в макос есть нативный способ выполнять задачи по таймеру

управляет запуском задач программа (демон) `launchd`

`~/Library/LaunchAgents/` - папка задач текущего пользователя

## XML Property List

задачи описываются в файлах формата `XML Property List (XML
plist)`. Это текстовый файл с жестко заданной структурой. Он всегда
начинается с объявления `XML` и `DOCTYPE`, а сами данные заключены в
тег `<plist>` с версией `1.0`

Вот обязательный каркас, с которого начинается любой такой файл:

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Здесь ключи и значения -->
</dict>
</plist>
```

Все содержимое находится внутри `<dict>`. Каждый параметр задается
парой: `<key>ИмяПараметра</key>` и следующим за ним значением
(например, `<string>текст</string>`, `<integer>30</integer>` или
`<true/>`)

## Обязательные ключи

Для задачи, которая должна просто запускать скрипт, `launchd` требует
наличия как минимум двух ключей:

1. `Label`: уникальный идентификатор задачи
2. `Program` или `ProgramArguments`: абсолютный путь к исполняемому
   файлу (случай `Program`) или массив строк где первый аргумент -
   путь к программе, а последующие - аргументы для нее (случай
   `ProgramArguments`)

## Ключи для расписания

- `StartInterval`: Запускает задачу каждые N секунд
- `StartCalendarInterval`: Запускает задачу в определенное время (как
  в cron). Можно указать Minute, Hour, Day, Weekday, Month

## Полезные ключи

- `StandardOutPath` и `StandardErrorPath`: Пути к файлам, куда будут
  записываться логи работы скрипта (обычный вывод и ошибки)
- `RunAtLoad`: Если установить `<true/>`, задача запустится сразу
  после загрузки.
- `WorkingDirectory`: Рабочая директория, в которой будет запущен
  скрипт. Полезно, если скрипт использует относительные пути.

## plist файл для моего скрипта

записываю в `~/Library/LaunchAgents/my.serr.git-backup.plist`

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>my.serr.git-backup</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/serr/.local/bin/git-backup</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <!-- :00, :30 -->
    <key>StartCalendarInterval</key>
    <array>
        <dict><key>Minute</key><integer>0</integer></dict>
        <dict><key>Minute</key><integer>30</integer></dict>
    </array>
</dict>
</plist>
```

активация так

```
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/my.serr.git-backup.plist
```

и после этого можно проверить что действительно отработал

```
~/projects/dotfiles
[serr@mac]-> launchctl list | grep git-backup
-	0	my.serr.git-backup
```

код 0 значит все ок (согласно моему скрипту)

выгрузка так (для текущей сессии, а после перезагруки устройства снова
заработает)

```
launchctl bootout gui/$(id -u)/my.serr.git-backup
```

а чтобы навсегда удалить задачу надо ее выгрузить и удалить
соответствующий ей `plist` файл
