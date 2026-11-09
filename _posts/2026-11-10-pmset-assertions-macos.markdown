---
layout: post
title: Как проверить, что мешает компу уснуть / macOS pmset
categories: [it, macos]
---

# как проверяю я

Когда хочу узнать, держит ли сейчас какая-то программа комп
включённым, смотрю вывод `pmset -g assertions`. В начале там общая
сводка, а ниже, в `Listed by owning process`, видно, какой процесс
держит каждое ограничение на сон

# без caffeinate

```
~
[serr@mac]-> pmset -g assertions
2026-11-10 01:34:24 +0300
Assertion status system-wide:
   BackgroundTask                 0
   ApplePushServiceTask           0
   UserIsActive                   1
   PreventUserIdleDisplaySleep    0
   PreventSystemSleep             0
   ExternalMedia                  0
   InternalPreventDisplaySleep    1
   PreventUserIdleSystemSleep     1
   NetworkClientActive            0
Listed by owning process:
   pid 157(WindowServer): [0x00017a3300099b6e] 00:00:00 UserIsActive named: "com.apple.iohideventsystem.queue.tickle serviceID:1000009cb service:AppleHIDKeyboardEventDriverV2 product:Apple Internal Keyboard / Trackpad eventType:3"
	Timeout will fire in 600 secs Action=TimeoutActionRelease
   pid 101(powerd): [0x000172dd00019acf] 00:58:16 PreventUserIdleSystemSleep named: "Powerd - Prevent sleep while display is on"
   pid 101(powerd): [0x00017bd80010821c] 00:00:23 InternalPreventDisplaySleep named: "com.apple.powermanagement.delayDisplayOff"
	Timeout will fire in 277 secs Action=TimeoutActionTurnOff
Kernel Assertions: 0x100=MAGICWAKE
   id=550  level=255 0x100=MAGICWAKE creat=07.11.2026, 19:26  mod=09.11.2026, 17:51 description=en0 owner=IOSkywalkNetworkBSDClient
```

# с caffeinate

```
~
[serr@mac]-> pmset -g assertions
2026-11-10 01:35:20 +0300
Assertion status system-wide:
   BackgroundTask                 0
   ApplePushServiceTask           0
   UserIsActive                   1
   PreventUserIdleDisplaySleep    0
   PreventSystemSleep             0
   ExternalMedia                  0
   InternalPreventDisplaySleep    1
   PreventUserIdleSystemSleep     1
   NetworkClientActive            0
Listed by owning process:
   pid 61412(caffeinate): [0x000180bb00019c2e] 00:00:02 PreventUserIdleSystemSleep named: "caffeinate command-line tool"
	Details: caffeinate asserting forever
	Localized=THE CAFFEINATE TOOL IS PREVENTING SLEEP.
   pid 157(WindowServer): [0x00017a3300099b6e] 00:00:00 UserIsActive named: "com.apple.iohideventsystem.queue.tickle serviceID:1000009cb service:AppleHIDKeyboardEventDriverV2 product:Apple Internal Keyboard / Trackpad eventType:3"
	Timeout will fire in 600 secs Action=TimeoutActionRelease
   pid 101(powerd): [0x000172dd00019acf] 00:59:12 PreventUserIdleSystemSleep named: "Powerd - Prevent sleep while display is on"
   pid 101(powerd): [0x00017bd80010821c] 00:01:19 InternalPreventDisplaySleep named: "com.apple.powermanagement.delayDisplayOff"
	Timeout will fire in 221 secs Action=TimeoutActionTurnOff
Kernel Assertions: 0x100=MAGICWAKE
   id=550  level=255 0x100=MAGICWAKE creat=07.11.2026, 19:26  mod=09.11.2026, 17:51 description=en0 owner=IOSkywalkNetworkBSDClient
```

В первом случае `powerd` удерживает от сна, пока включён экран. Во
втором в списке появляется ещё и `caffeinate`, который отдельно
запрещает автоматический сон при бездействии
