---
layout: default
title: Как я уменьшил в 2 раза число системных вызовов newfstatat в mado
---

- NAME: Как я уменьшил в 2 раза число системных вызовов newfstatat в mado
- TAGS: it, linux, syscall, performance

# Что за mado?

Программа, которую я периодически пишу и использую для ведения заметок
и задач: [mado](https://github.com/laserattack/mado) - markdown
organizer for Linux

# Проблема

Я создал 10000 заметок, которые программа должна обработать и вот что
я обнаружил:

```
 36.26    0.086568           4     20090           newfstatat
```

20000 системные вызовов stat на 10000 записей. при этом явно в
программе stat вызывается один раз на запись. так с чего системных
вызовов в 2 раза больше чем должно быть?

# Расследование

## Локализую проблему

оказалось для каждой записи вот что происходит

```
newfstatat(AT_FDCWD, "/home/serr/projects/mado/MADO/20260107T020900/MAIN.md", {st_mode=S_IFREG|0644, st_size=2543, ...}, 0) = 0
 > /usr/lib/libc.so.6(fstatat+0xa) [0xf76aa]
 > /home/serr/projects/mado/mado(+0x0) [0x11c72]
 > /home/serr/projects/mado/mado(+0x0) [0x147ce]
 > /home/serr/projects/mado/mado(_ZL8cmd_listiPPc+0x713) [0xa203]
 > /home/serr/projects/mado/mado(main+0xdd) [0x764d]
 > /usr/lib/libc.so.6(__libc_start_call_main+0x7c) [0x2abfc]
 > /usr/lib/libc.so.6(__libc_start_main+0x85) [0x2acb5]
 > /home/serr/projects/mado/mado(_start+0x21) [0x7831]
newfstatat(AT_FDCWD, "/etc/localtime", {st_mode=S_IFREG|0644, st_size=1535, ...}, 0) = 0
 > /usr/lib/libc.so.6(fstatat+0xa) [0xf76aa]
 > /usr/lib/libc.so.6(__tzfile_read+0xec) [0xcae0c]
 > /usr/lib/libc.so.6(tzset_internal+0x154) [0xca9a4]
 > /usr/lib/libc.so.6(__tz_convert+0x53) [0xcaba3]
 > /home/serr/projects/mado/mado(+0x0) [0x1281d]
 > /home/serr/projects/mado/mado(+0x0) [0x147ce]
 > /home/serr/projects/mado/mado(_ZL8cmd_listiPPc+0x713) [0xa203]
 > /home/serr/projects/mado/mado(main+0xdd) [0x764d]
 > /usr/lib/libc.so.6(__libc_start_call_main+0x7c) [0x2abfc]
```

посмотрю что там

```
0x0000000000012818 <+5896>:	call   0x5260 <localtime@plt>
0x000000000001281d <+5901>:	lea    0x9e1e(%rip),%rdx
```

т.е. первый системный вызов - тот, который я делаю явно, а второй -
получение информации о таймзоне через функцию `localtime`

вот проблемный участок кода

```
if (need_mtime) {
    struct stat st;
    if (stat(entry_file.c_str(), &st) == 0) {
        std::tm *tm = std::localtime(&st.st_mtime);
        char buf[16];
        std::strftime(buf, sizeof(buf), "%Y%m%dT%H%M%S", tm);
        entry->mtime = buf;
    } else {
        return nullptr;
    }
}
```

получается что функция `std::localtime`

```
std::tm *tm = std::localtime(&st.st_mtime);
```

для каждой записи заново узнает информацию о таймзоне

## Откуда берется локальное время

В системах Linux информация о часовом поясе (таймзоне) хранится в
файле `/etc/localtime`

Когда программа запрашивает локальное время, библиотека `libc` должна
знать:

- Смещение от UTC
- Правила перехода на летнее/зимнее время

вот тут
[man7.org/linux/man-pages/man3/localtime.3.html](https://man7.org/linux/man-pages/man3/localtime.3.html)
есть такой абзац

> The localtime() function converts the calendar time timep to
> broken-down time representation, expressed relative to the user's
> specified timezone. The function also sets the external variables
> tzname, timezone, and daylight as if it called tzset(3). The return
> value points to a statically allocated struct which might be
> overwritten by subsequent calls to any of the date and time
> functions. The localtime_r() function does the same, but stores the
> data in a user-supplied struct. It need not set tzname, timezone,
> and daylight.

ключевое тут про `localtime` вот что

> The function also sets the external variables tzname, timezone, and
> daylight as if it called tzset(3)

т.е. она действительно при каждом вызове читает информацию о таймзоне,
а значит обращается к `/etc/localtime`

тут же написано про другую функцию - `localtime_r`

> The localtime_r() function does the same, but stores the data in a
> user-supplied struct. It need not set tzname, timezone, and
> daylight.

а вот она не читает информацию о таймзоне при каждом вызове

## Расследую далее

поменял `std::localtime` на `localtime_r`

```
modified   libmado/mado.cpp
@@ -228,9 +228,10 @@ Mado_Entry::parse(const Mado_Config *cfg,
     if (need_mtime) {
         struct stat st;
         if (stat(entry_file.c_str(), &st) == 0) {
-            std::tm *tm = std::localtime(&st.st_mtime);
+            struct tm tm_result;
+            localtime_r(&st.st_mtime, &tm_result);
             char buf[16];
-            std::strftime(buf, sizeof(buf), "%Y%m%dT%H%M%S", tm);
+            std::strftime(buf, sizeof(buf), "%Y%m%dT%H%M%S", &tm_result);
             entry->mtime = buf;
         } else {
             return nullptr;
```

и действительно получаю уменьшение числа системных вызовов в 2 раза

```
 25.18    0.043956           4     10047           newfstatat
```

но обращение к `/etc/localtime` все таки происходит

```
openat(AT_FDCWD, "/etc/localtime", O_RDONLY|O_CLOEXEC) = 4
 > /usr/lib/libc.so.6(__open64_nocancel+0x3e) [0xfbdee]
 > /usr/lib/libc.so.6(_IO_file_open+0xb5) [0x84bd5]
 > /usr/lib/libc.so.6(_IO_file_fopen+0xc5) [0x84cb5]
 > /usr/lib/libc.so.6(__fopen_internal+0x79) [0x79459]
 > /usr/lib/libc.so.6(__tzfile_read+0x103) [0xcae23]
 > /usr/lib/libc.so.6(tzset_internal+0x154) [0xca9a4]
 > /usr/lib/libc.so.6(__tz_convert+0x53) [0xcaba3]
 > /home/serr/projects/mado/mado(+0x0) [0x12828]
 > /home/serr/projects/mado/mado(+0x0) [0x147ce]
 > /home/serr/projects/mado/mado(_ZL8cmd_listiPPc+0x713) [0xa203]
```

вот оно тут

```
0x0000000000012823 <+5907>:	call   0x51c0 <localtime_r@plt>
0x0000000000012828 <+5912>:	mov    %r13,%rcx
```

но происходит всего 1 раз за время работы программы. `localtime_r`
обращается к файлу если внутренние переменные с инфой о таймзоне не
установлены, но если они установлены - не обращается, а просто
использует инфу из них

вот что еще есть в мануале

> According to POSIX.1, localtime() is required to behave as though
> tzset(3) was called, while localtime_r() does not have this
> requirement.  For portable code, tzset(3) should be called before
> localtime_r()

т.е. рекомендуется все таки явно инициализировать внутренние
переменные таймзоны через `tzset()`

# Что в итоге

Заменив `std::localtime()` на `localtime_r()` + однократный вызов
`tzset()`, убрал лишний системный вызов `stat()` для `/etc/localtime`
на каждую запись

**Результат на 100 000 записей:**

- Время выполнения: **~4.0 с -> ~3.5 с**
- Ускорение: **~12%**
- Сокращение системных вызовов: **100 000 `newfstatat`**
