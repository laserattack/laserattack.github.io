---
layout: post
title: как устроено приложение Happ на macOS
categories: [macos, it]
---

> пост сгенерирован ии, я чуть чуть поредактировал

# Почему у Happ два компонента

> Happ — клиент для работы с прокси-серверами на базе ядра Xray.
>
> Приложение поддерживает VLESS, VMess, Trojan, Shadowsocks и SOCKS,
> позволяет выбирать сервер и задавать правила маршрутизации.
> Это описано в [репозитории разработчика](https://github.com/Happ-proxy/happ-desktop).

Проверял автозагрузку Happ. Сначала запросил обычные объекты входа:

```console
$ osascript -e 'tell application "System Events" to get the name of every login item'
```

Вывод пустой. Но это ещё не вся автозагрузка macOS. Проверил системные
службы и пользовательские агенты:

```console
$ find ~/Library/LaunchAgents /Library/LaunchAgents /Library/LaunchDaemons \
  -iname '*happ*' -print 2>/dev/null
/Library/LaunchDaemons/com.happ.happd.plist
```

Получается, у Happ есть видимое приложение и отдельная фоновая служба.

# Happ.app и happd

**Happ.app** — приложение с интерфейсом. Здесь находятся список
серверов, настройки и кнопка подключения.

**happd** — фоновая служба. В истории обновлений разработчики отдельно
описывают её установку, восстановление и автоматический перезапуск
после сбоя. То есть служба — отдельный рабочий компонент клиента.
[Источник: релизы Happ](https://github.com/Happ-proxy/happ-desktop/releases).

Практический смысл такого разделения — отделить интерфейс от
системной части, которой для настройки туннеля и маршрутов нужны
повышенные права. Окно приложения служит пультом управления.

А файл `com.happ.happd.plist` — инструкция для системного менеджера
служб `launchd`. Наличие этого компонента подтверждается и
[описанием пакета Homebrew](https://github.com/Homebrew/homebrew-cask/blob/master/Casks/h/happ.rb).

# Что записано в настройках службы

Посмотрел содержимое найденного файла.

```console
$ plutil -p /Library/LaunchDaemons/com.happ.happd.plist
{
  "AssociatedBundleIdentifiers" => "com.happ.www"
  "KeepAlive" => 1
  "Label" => "com.happ.happd"
  "ProgramArguments" => [
    0 => "/Applications/Happ.app/Contents/MacOS/happd"
  ]
  "RunAtLoad" => 1
  "StandardErrorPath" => "/var/log/happd.log"
  "StandardOutPath" => "/var/log/happd.log"
}
```

Здесь задан автоматический запуск службы:

- `RunAtLoad => 1` — запускать при загрузке задания в `launchd`.
  Для службы в `/Library/LaunchDaemons` это обычно происходит при
  загрузке macOS, ещё до входа пользователя.
- `KeepAlive => 1` — поддерживать процесс работающим и запускать
  заново после завершения.
- `Label` — идентификатор службы: `com.happ.happd`.
- `ProgramArguments` — исполняемый файл находится внутри `Happ.app`:
  `/Applications/Happ.app/Contents/MacOS/happd`.
- `AssociatedBundleIdentifiers` — связь службы с приложением
  `com.happ.www`.
- `StandardOutPath` и `StandardErrorPath` — стандартный вывод и ошибки
  направляются в один файл `/var/log/happd.log`.

**Конфигурация предусматривает автозапуск и постоянную работу
happd**. Явный запрет запуска через `launchctl` может переопределить
это поведение.

# Настройки запуска и фактический статус — разные вещи

Содержимое `.plist` показывает, как служба должна запускаться.
Чтобы узнать, работает ли она сейчас, нужен отдельный запрос:

```sh
sudo launchctl print system/com.happ.happd
```

Отдельно проверяется явный запрет запуска:

```sh
sudo launchctl print-disabled system | grep -i happ
```

Посмотреть последние сообщения службы можно командой:

```sh
sudo tail -n 50 /var/log/happd.log
```

Путь к журналу взят из показанного выше `.plist`.
