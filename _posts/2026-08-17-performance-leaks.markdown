---
layout: default
title: Нахождение утечек и узких мест в производительности программ
---

- NAME: Нахождение утечек и узких мест в производительности программ
- TAGS: it, linux, valgrind, strace, time

# time

просто проверка времени работы

```
~/projects/mado
[serr@lap]-> time mado ls 's ~ ope'
<ВЫВОД ПРОГРАММЫ>
real	0m5.091s
user	0m4.247s
sys	0m0.823s
```

# valgrind

ищет утечки, использую такой алиас

```
~/projects/mado
[serr@lap]-> cat ~/.bashrc | grep valgall
alias valgall='valgrind --leak-check=full --show-leak-kinds=all'
```

пример

```
~/projects/mado
[serr@lap]-> valgall mado ls 's ~ ope'
==8710== Memcheck, a memory error detector
==8710== Copyright (C) 2002-2024, and GNU GPL'd, by Julian Seward et al.
==8710== Using Valgrind-3.25.1 and LibVEX; rerun with -h for copyright info
==8710== Command: mado ls s\ ~\ ope
==8710==
<ВЫВОД ПРОГРАММЫ>
==8710==
==8710== HEAP SUMMARY:
==8710==     in use at exit: 0 bytes in 0 blocks
==8710==   total heap usage: 2,601,468 allocs, 2,601,468 frees, 1,243,906,158 bytes allocated
==8710==
==8710== All heap blocks were freed -- no leaks are possible
==8710==
==8710== For lists of detected and suppressed errors, rerun with: -s
==8710== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
```

# strace

`strace` — это утилита для трассировки системных вызовов
(syscalls). Позволяет увидеть, с какими файлами, сокетами, процессами
и памятью взаимодействует программа на уровне ядра. Используется для
поиска узких мест, связанных с I/O, работой с файловой системой и
сетевыми операциями

пример

```
~/projects/mado
[serr@lap]-> strace -c mado ls 's ~ ope'
<ВЫВОД ПРОГРАММЫ>
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 40.02    0.852957           4    200090           newfstatat
 24.41    0.520218           5    100063        12 openat
 17.66    0.376334           3    100091           read
 15.83    0.337496           3    100051           close
  1.87    0.039811         321       124           getdents64
  0.18    0.003920           5       681           brk
  0.02    0.000450          90         5           munmap
  0.01    0.000196           7        26           mmap
  0.00    0.000048           8         6           mprotect
  0.00    0.000023           2         9           fstat
  0.00    0.000008           4         2           pread64
  0.00    0.000006           3         2           fcntl
  0.00    0.000006           6         1           getcwd
  0.00    0.000006           6         1           getrandom
  0.00    0.000005           5         1           futex
  0.00    0.000004           4         1           lseek
  0.00    0.000004           4         1           arch_prctl
  0.00    0.000004           4         1           set_tid_address
  0.00    0.000004           4         1           set_robust_list
  0.00    0.000004           4         1           prlimit64
  0.00    0.000003           3         1           rseq
  0.00    0.000000           0         2           write
  0.00    0.000000           0         1         1 access
  0.00    0.000000           0         1           execve
------ ----------- ----------- --------- --------- ----------------
100.00    2.131507           4    501163        13 total
```

далее можно узнать подробности про конкретный syscall, пишется
например с какими аргументами вызывается

```
~/projects/mado
[serr@lap]-> strace -k -e trace=newfstatat mado ls 's ~ ope' 2>&1 | head -50
newfstatat(AT_FDCWD, "/home/serr/projects/mado/MADO", {st_mode=S_IFDIR|0755, st_size=3547136, ...}, 0) = 0
 > /usr/lib/libc.so.6(fstatat+0xa) [0xf76aa]
 > /usr/lib/libstdc++.so.6.0.33(+0x0) [0x1cd760]
 > /usr/lib/libstdc++.so.6.0.33(+0x0) [0x1cddf9]
 > /home/serr/projects/mado/mado(+0x0) [0xebe6]
 > /home/serr/projects/mado/mado(_ZL8cmd_listiPPc+0x133) [0x9a23]
 > /home/serr/projects/mado/mado(main+0xe2) [0x7462]
 > /usr/lib/libc.so.6(__libc_start_call_main+0x7c) [0x2abfc]
 > /usr/lib/libc.so.6(__libc_start_main+0x85) [0x2acb5]
 > /home/serr/projects/mado/mado(_start+0x21) [0x7631]
newfstatat(AT_FDCWD, "/home/serr/projects/mado/MADO", {st_mode=S_IFDIR|0755, st_size=3547136, ...}, 0) = 0
 > /usr/lib/libc.so.6(fstatat+0xa) [0xf76aa]
 > /usr/lib/libstdc++.so.6.0.33(+0x0) [0x1cd760]
 > /usr/lib/libstdc++.so.6.0.33(+0x0) [0x1cddf9]
 > /home/serr/projects/mado/mado(+0x0) [0x13a72]
 > /home/serr/projects/mado/mado(_ZL8cmd_listiPPc+0x713) [0xa003]
 > /home/serr/projects/mado/mado(main+0xe2) [0x7462]
 > /usr/lib/libc.so.6(__libc_start_call_main+0x7c) [0x2abfc]
 > /usr/lib/libc.so.6(__libc_start_main+0x85) [0x2acb5]
 > /home/serr/projects/mado/mado(_start+0x21) [0x7631]
newfstatat(AT_FDCWD, "/home/serr/projects/mado/MADO", {st_mode=S_IFDIR|0755, st_size=3547136, ...}, 0) = 0
 > /usr/lib/libc.so.6(fstatat+0xa) [0xf76aa]
 > /usr/lib/libstdc++.so.6.0.33(+0x0) [0x1cd760]
 > /usr/lib/libstdc++.so.6.0.33(+0x0) [0x1cddf9]
 > /home/serr/projects/mado/mado(+0x0) [0x13ab0]
 > /home/serr/projects/mado/mado(_ZL8cmd_listiPPc+0x713) [0xa003]
 > /home/serr/projects/mado/mado(main+0xe2) [0x7462]
 > /usr/lib/libc.so.6(__libc_start_call_main+0x7c) [0x2abfc]
 > /usr/lib/libc.so.6(__libc_start_main+0x85) [0x2acb5]
 > /home/serr/projects/mado/mado(_start+0x21) [0x7631]
newfstatat(AT_FDCWD, "/home/serr/projects/mado/MADO/20260110T143500/MAIN.md", {st_mode=S_IFREG|0644, st_size=2544, ...}, 0) = 0
 > /usr/lib/libc.so.6(fstatat+0xa) [0xf76aa]
 > /home/serr/projects/mado/mado(+0x0) [0x113f2]
 > /home/serr/projects/mado/mado(+0x0) [0x13eaa]
 > /home/serr/projects/mado/mado(_ZL8cmd_listiPPc+0x713) [0xa003]
 > /home/serr/projects/mado/mado(main+0xe2) [0x7462]
 > /usr/lib/libc.so.6(__libc_start_call_main+0x7c) [0x2abfc]
 > /usr/lib/libc.so.6(__libc_start_main+0x85) [0x2acb5]
 > /home/serr/projects/mado/mado(_start+0x21) [0x7631]
newfstatat(AT_FDCWD, "/home/serr/projects/mado/MADO/20260220T003100/MAIN.md", {st_mode=S_IFREG|0644, st_size=2544, ...}, 0) = 0
 > /usr/lib/libc.so.6(fstatat+0xa) [0xf76aa]
 > /home/serr/projects/mado/mado(+0x0) [0x113f2]
 > /home/serr/projects/mado/mado(+0x0) [0x13eaa]
 > /home/serr/projects/mado/mado(_ZL8cmd_listiPPc+0x713) [0xa003]
 > /home/serr/projects/mado/mado(main+0xe2) [0x7462]
 > /usr/lib/libc.so.6(__libc_start_call_main+0x7c) [0x2abfc]
 > /usr/lib/libc.so.6(__libc_start_main+0x85) [0x2acb5]
 > /home/serr/projects/mado/mado(_start+0x21) [0x7631]
newfstatat(AT_FDCWD, "/etc/localtime", {st_mode=S_IFREG|0644, st_size=1535, ...}, 0) = 0
 > /usr/lib/libc.so.6(fstatat+0xa) [0xf76aa]
```
