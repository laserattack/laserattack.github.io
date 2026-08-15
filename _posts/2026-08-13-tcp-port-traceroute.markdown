---
layout: default
title: tcp traceroute с конкретным портом
---

- NAME: tcp traceroute с конкретным портом
- TAGS: vpn, traceroute, network, ssh

например бывает что ssh не подключается к серверу хотя пинг к нему
идет, тут вот пример как потрейсить

```
sudo traceroute -T -p 14160 91.239.206.123
```
