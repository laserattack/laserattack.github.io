---
layout: default
title: Использование PGP ключей для доступа по SSH
---

- NAME: Использование PGP ключей для доступа по SSH
- TAGS: it, linux, guide, pgp, ssh

# Матчасть

## gpg-agent

**gpg-agent** — это программа-посредник, которая:

- Хранит приватные ключи в памяти
- Запрашивает пароль, когда нужно использовать ключ
- Выполняет операции (подпись, расшифровка) не отдавая ключ наружу

Простыми словами: ваши секретные ключи лежат на диске
зашифрованными. Когда приложению нужно что-то подписать или
расшифровать, оно не трогает файлы напрямую, а просит gpg-agent
сделать это. Агент сам расшифровывает ключ (спросив пароль), выполняет
операцию и отдаёт результат

Обычно SSH работает через ssh-agent, который хранит обычные SSH-ключи

Но вы хотите использовать GPG-ключ для SSH. Значит:

- SSH-клиент должен общаться не с ssh-agent, а с gpg-agent
- gpg-agent должен уметь говорить по протоколу SSH
- gpg-agent должен знать, какой GPG-субключ использовать для SSH

# Настройка

## Настройка конфига агента

```
echo "enable-ssh-support" > ~/.gnupg/gpg-agent.conf
echo "pinentry-program /usr/bin/pinentry-curses" >> ~/.gnupg/gpg-agent.conf
```

- `~/.gnupg/gpg-agent.conf` — файл настроек gpg-agent
- `pinentry-program /usr/bin/pinentry-curses` говорит gpg-agent, какую
  программу использовать для ввода пароля
- Строка `enable-ssh-support` говорит агенту: «Создай ещё один канал
  (сокет), по которому SSH-клиент сможет с тобой общаться»

## keygrip SSH-субключа

**Keygrip** — это внутренний идентификатор, который gpg-agent
использует для хранения и поиска ключей

```
~
[serr@lap]-> gpg --list-keys --with-keygrip --with-subkey-fingerprints 38A22EA086864C8F
pub   ed25519 2026-08-15 [SC]
      0C73E648FEEA465E8F6493AF38A22EA086864C8F
      Keygrip = 35AA36C80511FB0EA34C5FC183C30DB84629B3DD
uid           [ unknown] Primary Key (Clean)
sub   cv25519 2026-08-15 [E] [expires: 2027-08-15]
      9A819283B120FA7E83523B2E5DBD0FD73ACA057F
      Keygrip = 74E0DCAD28C27CF7DB8D8A5FFA900AC3D6340B43
sub   ed25519 2026-08-15 [A] [expires: 2027-08-15]
      41D2FE1921C303CD746A5B1E7CB4AF1623EBFD0D
      Keygrip = 8C5698905719F63292B051BC743F4DDE8F931C0F
sub   ed25519 2026-08-15 [S] [expires: 2027-08-15]
      A30018F5A2F7499F1474572E1CC271B607E17A73
      Keygrip = BAF88477B915A40928C0C9F8CB45F4E311C40FAE
```

для аутентификации этот `8C5698905719F63292B051BC743F4DDE8F931C0F`

## Регистрация ключа для SSH

```
echo "8C5698905719F63292B051BC743F4DDE8F931C0F" >> ~/.gnupg/sshcontrol
```

- `~/.gnupg/sshcontrol` — файл, в котором перечислены ключи,
  разрешённые для SSH
- Добавляя сюда keygrip, вы говорите gpg-agent: «Этот ключ можно
  использовать, когда SSH попросит подписать что-то»

## Перезапуск gpg-agent

```
gpgconf --kill gpg-agent
gpgconf --launch gpg-agent
```

- `--kill` — остановить текущего агента
- `--launch` — запустить нового, чтобы он прочитал gpg-agent.conf и
  sshcontrol

## Указать SSH-клиенту, где искать ключи

```
export SSH_AUTH_SOCK=$(gpgconf --list-dirs agent-ssh-socket)
```

- `gpgconf --list-dirs agent-ssh-socket` — спрашивает: «Где gpg-agent
  создал SSH-сокет?» Получаем путь, например
  `/run/user/1000/gnupg/S.gpg-agent.ssh`

Без этой строки SSH по умолчанию пойдёт в стандартный ssh-agent и не
увидит GPG-ключи

## Проверка что ключ виден

```
~
[serr@lap]-> ssh-add -L
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILDuVae20rXvJDEHZUqKjUYJ7837SFL2HG5O2xNa4XUE (none)
```

Это публичная часть GPG-ключа, экспортированная в SSH-формат

## Обновление информации о терминале

```
gpg-connect-agent updatestartuptty /bye &>/dev/null
```

gpg-connect-agent — отправляет команду работающему gpg-agent

- `updatestartuptty` — сообщает агенту: «Обнови информацию о текущем
  терминале, чтобы я мог показать окно ввода пароля именно здесь»
- `/bye` — закрывает соединение после выполнения

Без этой команды gpg-agent не знает, в каком терминале запрашивать
пароль, и SSH-подключение может завершиться ошибкой
`sign_and_send_pubkey: signing failed: agent refused operation`

## Добавление ключа на сервере

Для начала по PGP ключу, который поддерживает авторизацию,
генерируется ssh ключ

```
~
[serr@lap]-> gpg --export-ssh-key 41D2FE1921C303CD746A5B1E7CB4AF1623EBFD0D
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILDuVae20rXvJDEHZUqKjUYJ7837SFL2HG5O2xNa4XUE openpgp:0x23EBFD0D
```

на сервере добавляю этот ключ

```
serr@ninja3773:~$ echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILDuVae20rXvJDEHZUqKjUYJ7837SFL2HG5O2xNa4XUE openpgp:0x23EBFD0D" >> ~/.ssh/authorized_keys
```

ну и все, далее уже можно подключаться. в первый раз gpg-agent попросит
пассфразу, потом закеширует и уже не будет просить

# Автонастройка в при старте bash сессии

```
~
[serr@lap]-> echo '' >> ~/.bashrc
echo '# Использовать gpg-agent вместо ssh-agent' >> ~/.bashrc
echo 'export SSH_AUTH_SOCK=$(gpgconf --list-dirs agent-ssh-socket)' >> ~/.bashrc
echo 'gpg-connect-agent updatestartuptty /bye &>/dev/null' >> ~/.bashrc
```
