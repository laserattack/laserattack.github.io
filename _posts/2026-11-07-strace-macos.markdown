---
layout: post
title: strace на macOS / трассирование программ на macOS
categories: [it, macos]
---

# встроенный аналог

встроенный трассировщик по умолчанию не работает, потому что требует
отключения какой то системной защиты которую я не хочу отключать если
есть альтернатива работающая без ее отключения

```
~/projects/mado2
[serr@mac]-> sudo dtruss -c mado ls
Password:
dtrace: system integrity protection is on, some features will not be available

SYSCALL(args) 		 = return
<ВЫВОД ПРОГРАММЫ>

CALL                                        COUNT
```

mado - моя программа, которую мне надо трассировать, `ls` - ее
аргумент

# Mic92/strace-macos

Есть проект `Mic92/strace-macos`, который умеет собирать статистику
системных вызовов с флагом `-c` и рассчитан на работу с включённым
SIP.

```
~/projects
[serr@mac]-> git clone --depth=1 https://github.com/Mic92/strace-macos.git
~/projects
[serr@mac]-> cd strace-macos
```

далее такую штуку в `.zshrc`

``` bash
strace() {
  PYTHONPATH="$HOME/projects/strace-macos:$(xcrun lldb -P)" \
    /usr/bin/python3 -m strace_macos "$@"
}
```

и трассирование так

```
~/projects/mado2
[serr@mac]-> strace -c "$(command -v mado)" ls
warning: could not execute support code to read Objective-C class data because it's not yet safe to do so, and will be retried later.

warning: could not execute support code to read Objective-C class data because it's not yet safe to do so, and will be retried later.

% time     calls      errors syscall
--------------------------------------------------
  2.65          4            access
  1.99          3            close
  1.99          3            csops
  0.66          1            csops_audittoken
  1.32          2            fcntl
  1.32          2            fgetattrlist
  7.95         12            fstat
  0.66          1            fstatfs
  1.32          2            getattrlist
  0.66          1            getentropy
 22.52         34            getpid
  2.65          4            getrlimit
  7.28         11            gettimeofday
  1.32          2            ioctl
  2.65          4            issetugid
 13.25         20            kdebug_trace
  5.96          9            lseek
  1.32          2            mmap
 11.26         17            mprotect
  2.65          4            open
  1.32          2            shm_open
  5.30          8            stat
  1.99          3            sysctlbyname
--------------------------------------------------
100.00        151             total
```

`command -v mado` а не просто имя программы потому что программа
запускается через lldb, а там другое окружение

вывод самой программы тут не пишется
