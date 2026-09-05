---
layout: default
title: Проблема с определением заряда батареи на HP Victus 16
---

- NAME: Проблема с определением заряда батареи на HP Victus 16
- TAGS: linux, it, personal, guide, hardware

# Система

- **Модель:** HP Victus 16-e0xxx
- **ОС:** Void Linux
- **Ядро:** 6.18.45_1
- **Батарея**: 4-cell Li-ion polymer

# Проблема

системный мониторинг батареи всегда показывает **100%**, независимо от
реального уровня заряда

# Симптомы

- `/sys/class/power_supply/BAT0/energy_now` и
  `/sys/class/power_supply/BAT0/energy_full` показывают одинаковые
  значения (56672000)
- `/sys/class/power_supply/BAT0/power_now` не читается ("No such
  device")
- `/sys/class/power_supply/BAT0/status` меняется
  (Charging/Discharging/Full и тп)
- `/sys/class/power_supply/BAT0/voltage_now` меняется (работает)
- `/sys/class/power_supply/BAT0/capacity` всегда 100
- `/sys/class/power_supply/BAT0/capacity_level` всегда Full

# Диагностика

## ACPI запрос _BST (Battery Status)

```
echo '\_SB_.BAT0._BST' | sudo tee /proc/acpi/call
sudo cat /proc/acpi/call
```

вывод: `[0x0, 0xffffffff, 0xdd60, 0x4173]`

расшифровка:

- `0xffffffff` — скорость разряда (**неизвестно**, контроллер не может
  измерить ток)
- `0xdd60` — Оставшаяся ёмкость (`56672 mWh`, **застыло**)
- `0x4173` — напряжение (`16755 mV`, **работает**)

## ACPI запрос _BIF (Battery Information)

```
echo '\_SB_.BAT0._BIF' | sudo tee /proc/acpi/call
sudo cat /proc/acpi/call
```

вывод `[0x1, 0xdd60, 0xdd60, 0x1, 0x3c28, 0x1a96, 0xf83, 0x1fe, 0x8d,
"Primary", " ", "LION", "Hewlett-Packard"]`

- `0xdd60` — проектная емкость (`56672 mAh`)
- `0xdd60` — максимальная емкость при полном заряде (`56672 mAh`)
- `0x1` — технология (1 = перезаряжаемая)
- `0x3c28` — проектное напряжение, типо среднее при работе (`15400mV`)
- `0x1a96` — предупреждение о низком заряде (`6806 mAh`)
- `0xf83` — критически низкий заряд (`3971 mAh`)
- остальное не важно

# Причина

контроллер батареи (EC) не может измерить ток (скорость
разряда/заряда), из-за чего:

1. Не обновляется счётчик энергии (energy_now)
2. Система не может вычислить реальный процент заряда
3. power_now недоступен

при этом напряжение измеряется напрямую и работает корректно

# Решение

использовать напряжение батареи для оценки процента заряда вместо
неработающего счётчика энергии

скрипт который пишет текущий вольтаж в системный лог (socklog)

```
#!/usr/bin/env bash

VOLTAGE=$(cat /sys/class/power_supply/BAT0/voltage_now)
VOLTAGE_MV=$((VOLTAGE / 1000))

logger -t "current battery voltage" "${VOLTAGE_MV}"
```

поставил его на крон раз в минуту, чтобы всегда можно было посмотреть

таким образом можно будет спустя какое то время на зарядке узнать
максимальное значение, и его использовать типо как `100%` заряда
батареи, а потом разрядить ноут и посмотреть минимальное и
использовать его как `0%` заряда. и текущий процент считать
относительно их

конечно **измерение заряда на основе напряжения дает погрешность в
точности**, но это хотя бы что то

вообще нашел [статью](https://en.wikipedia.org/wiki/Lithium-ion_battery)

там написано

> Lithium-ion cells are susceptible to stress by voltage ranges
> outside of safe ones between 2.5 and 3.65/4.1/4.2 or 4.35 V
> (depending on the components of the cell)

т.е. минимум `2.5 V` на элемент, на 4 элемента как у меня в батарее
это значит `10 V` а максимум зависит от конкретной батареи, нейросеть
говорит что для моей `4.2 V`, т.е. на 4 элемента это `16.8 V`

по моим логам максимум где то `16.76`

```
~
[serr@lap]-> sucklog user | grep battery
2026-09-05T12:31:01.15228 user.notice: Sep  5 15:31:01 current battery voltage: 16765
2026-09-05T12:32:01.15999 user.notice: Sep  5 15:32:01 current battery voltage: 16765
2026-09-05T12:33:01.16847 user.notice: Sep  5 15:33:01 current battery voltage: 16764
2026-09-05T12:34:01.17606 user.notice: Sep  5 15:34:01 current battery voltage: 16764
2026-09-05T12:35:01.18485 user.notice: Sep  5 15:35:01 current battery voltage: 16764
2026-09-05T12:36:01.19382 user.notice: Sep  5 15:36:01 current battery voltage: 16764
2026-09-05T12:37:01.20235 user.notice: Sep  5 15:37:01 current battery voltage: 16764
2026-09-05T12:38:01.20998 user.notice: Sep  5 15:38:01 current battery voltage: 16764
2026-09-05T12:39:01.21902 user.notice: Sep  5 15:39:01 current battery voltage: 16764
2026-09-05T12:40:01.22840 user.notice: Sep  5 15:40:01 current battery voltage: 16764
2026-09-05T12:41:01.23742 user.notice: Sep  5 15:41:01 current battery voltage: 16765
```

а `10 V` это конечно абсолютный минимум до которого не опустится

[тут](https://en.highstar.com/blog/lithium-ion-battery-cell-voltage-nominal-cutoff-charging-guide)
например сказано

> Typically, Li-ion cells operate with a discharge cutoff around 3.0V

т.е. это `12 V` на 4 элемента, такое и возьму за минимум пока что,
потом мб подкорректирую по логам

т.е. пока что вот так считаю зарядку

```
#!/usr/bin/env bash

MAX_VOLTAGE=16800
MIN_VOLTAGE=12000

VOLTAGE=$(cat /sys/class/power_supply/BAT0/voltage_now)
VOLTAGE_MV=$((VOLTAGE / 1000))

PERCENT=$(echo "scale=0; ($VOLTAGE_MV - $MIN_VOLTAGE) * 100 / ($MAX_VOLTAGE - $MIN_VOLTAGE)" | bc)

[ $PERCENT -gt 100 ] && PERCENT=100
[ $PERCENT -lt 0 ] && PERCENT=0

echo "BAT ${PERCENT}% (${VOLTAGE_MV}mV)"
```
