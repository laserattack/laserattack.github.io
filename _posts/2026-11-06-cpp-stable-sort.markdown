---
layout: post
title: Стабильная сортировка в C++ (std::stable_sort)
categories: [it, programming]
---

> пост сгенерирован с помощью ИИ

`std::stable_sort` из заголовка `<algorithm>` сохраняет относительный
порядок элементов, которые компаратор считает эквивалентными.

Например, отсортируем записи по возрастанию приоритета. Исходный
порядок — `A(5), B(2), C(5)`, результат — `B(2), A(5), C(5)`.
Приоритеты `A` и `C` равны, поэтому `A` остаётся перед `C`.
`std::sort` такого порядка не гарантирует.

```cpp
std::stable_sort(entries.begin(), entries.end(),
    [](const auto& a, const auto& b) {
        return a.priority < b.priority;
    });
```
