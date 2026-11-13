---
layout: post
title: macos удаление приложения поставленного из .dmg на примере Gajim
categories: [it, macos]
---

я ставлю приложения либо через пакетник homebrew либо из `.dmg` файлов

вот так проверил что ставил не через homebrew (пустой вывод)

```
~/Desktop
[serr@mac]-> brew list -l | grep gajim
```

вот так ищу приложение

```
~/Desktop
[serr@mac]-> ls /Applications | grep -i gajim
Gajim.app
```

`.app` - директория со всеми файлами которые нужны приложению для
работы

удяляю

```
~/Desktop
[serr@mac]-> sudo rm -rf /Applications/Gajim.app
~/Desktop
[serr@mac]-> du -sh /Applications/Gajim.app/
du: /Applications/Gajim.app/: No such file or directory
```

но вероятно остались еще всякие кэши и файлы настроек, их тоже надо
удалить

ищу

```
~/Desktop
[serr@mac]-> find ~/ -iname '*gajim*' 2>/dev/null
/Users/serr/.config/gajim
/Users/serr/.local/share/gajim
/Users/serr/Library/Preferences/org.gajim.gajim.plist
/Users/serr/.cache/gajim
```

тут все действительно относится к gajim, ложных совпадений нет, значит
можно каждую строку вывода этой команды передать в `rm -rf`

```
find ~/ -iname '*gajim*' -exec rm -rf {} +
```
