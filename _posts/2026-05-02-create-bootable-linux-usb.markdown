---
layout: default
title: Создание загрузочной флешки Linux
---

- NAME: Создание загрузочной флешки Linux
- TAGS: guide, it, linux

вот подключил флешку

```
~
[serr@lap]-> lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda           8:0    1  57.8G  0 disk
└─sda1        8:1    1  57.8G  0 part /run/media/serr/19043_1052_
nvme0n1     259:0    0 476.9G  0 disk
├─nvme0n1p1 259:1    0   512M  0 part /boot/efi
├─nvme0n1p2 259:2    0     2G  0 part [SWAP]
└─nvme0n1p3 259:3    0 474.4G  0 part /var/lib/docker
                                      /
```

вот она

```
sda           8:0    1  57.8G  0 disk
└─sda1        8:1    1  57.8G  0 part /run/media/serr/19043_1052_
```

размонтирую раздел

```
sudo umount /run/media/serr/19043_1052_
```

```
~
[serr@lap]-> lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda           8:0    1  57.8G  0 disk
└─sda1        8:1    1  57.8G  0 part
nvme0n1     259:0    0 476.9G  0 disk
├─nvme0n1p1 259:1    0   512M  0 part /boot/efi
├─nvme0n1p2 259:2    0     2G  0 part [SWAP]
└─nvme0n1p3 259:3    0 474.4G  0 part /var/lib/docker
                                      /
```

туда записываю iso

```
~/Desktop/iso
[serr@lap]-> sudo dd if=gentoo-install-amd64-minimal-20260426T153103Z.iso of=/dev/sda bs=4M status=progress conv=fsync
792723456 bytes (793 MB, 756 MiB) copied, 1 s, 791 MB/s1052526592 bytes (1.1 GB, 1004 MiB) copied, 1.33385 s, 789 MB/s

250+1 records in
250+1 records out
1052526592 bytes (1.1 GB, 1004 MiB) copied, 180.731 s, 5.8 MB/s
```

программно извлекаю флешку

```
sudo eject /dev/sda
```
