---
layout: default
title: свой домен github pages
categories: it
---

Домен у меня `laserattack.net`

# Общий порядок действий

Вот
[тут](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
документация от гитхаба

1. Зайти в `Settings -> Pages` репозитория.
2. Ввести домен в `Custom domain` и нажать `Save`.
3. Потом идти к регистратору и настраивать DNS.

# DNS-записи типа A

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

скриншот настройки DNS

![](/assets/images/dns-github-pages.png)

# Настройка в репозитории

в `Settings -> Pages` ввести домен. гитхаб проверит днс минут за 15 и
сайт будет доступен по

```
http://laserattack.net
http://www.laserattack.net
https://laserattack.net
https://www.laserattack.net
```

надо еще галочку поставить на `Enforce HTTPS` и запросы по HTTP будут
автоматически перенаправляться на HTTPS

ну и ссылки вида `laserattack.github.io` остаются рабочими, теперь
тоже будут редиректить на `https://laserattack.net`
