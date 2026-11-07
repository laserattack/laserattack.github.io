---
layout: post
title: Свои виджеты на рабочий стол macOS
categories: [it, macos]
---

# ubersicht

`ubersicht` - open-source приложение, которое устанавливается через
Homebrew и позволяет создавать виджеты с помощью JavaScript и CSS

ставлю так

```
brew install --cask ubersicht
```

директория с виджетами

```
~
[serr@mac]-> ls -la ~/Library/"Application Support"/Übersicht/widgets
total 8
drwxr-xr-x@ 3 serr  staff    96  7 ноя 17:42 .
drwxr-xr-x@ 3 serr  staff    96  7 ноя 17:42 ..
-rw-r--r--@ 1 serr  staff  1839  4 дек  2023 GettingStarted.jsx
```

там есть виджет по умолчанию `GettingStarted.jsx`, он текст с
приветствием приводит - его удаляю

# свой виджет

у меня алиас на `brew` который в файл записывает временную метку
последнего обновления пакетов и я хочу на рабочем столе видеть сколько
дней назад я их обновлять

``` bash
brew() {
  if [[ "${1:-}" == "upgrade" ]]; then
    command brew "$@"
    local result=$?

    if [[ $result -eq 0 ]]; then
      date +%s > "$HOME/.homebrew-last-upgrade"
    fi

    return "$result"
  fi

  command brew "$@"
}
```

вот примерно так пишется виджет. он читает метку из файла и красиво
форматирует информацию о последнем обновлении на рабочий стол в виде
виджета

обновление информации раз в 60сек. задается `refreshFrequency`

``` jsx
export const refreshFrequency = 60000;

export const command = `
# Last successful Homebrew upgrade
STAMP="$HOME/.homebrew-last-upgrade"

if [ -f "$STAMP" ]; then
  LAST=$(cat "$STAMP" 2>/dev/null)
  NOW=$(date +%s)

  case "$LAST" in
    ''|*[!0-9]*)
      echo "BREW|0|UNKNOWN"
      ;;
    *)
      if [ "$LAST" -le "$NOW" ]; then
        DAYS=$(( (NOW - LAST) / 86400 ))
        echo "BREW|$DAYS|OK"
      else
        echo "BREW|0|UNKNOWN"
      fi
      ;;
  esac
else
  echo "BREW|0|NEVER"
fi
`;

export const className = `
  top: 15px;
  left: 16px;
  width: 270px;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
`;

const colors = {
  green: "#36d987",
  yellow: "#ffbd59",
  red: "#ff606b",
  muted: "#999",
};

const statusDot = (color) => ({
  width: 10,
  height: 10,
  flexShrink: 0,
  borderRadius: "50%",
  background: color,
  boxShadow: `0 0 8px ${color}44`,
});

const HomebrewRow = ({ days, status }) => {
  const known = status === "OK";
  const count = Number(days);

  const color = !known
    ? colors.muted
    : count <= 14
      ? colors.green
      : count <= 20
        ? colors.yellow
        : colors.red;

  const label = !known
    ? status === "NEVER"
      ? "No upgrade recorded"
      : "Upgrade date unknown"
    : count === 0
      ? "Upgraded today"
      : count === 1
        ? "Upgraded 1 day ago"
        : `Upgraded ${count} days ago`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={statusDot(color)} />

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          Homebrew
        </div>

        <div
          style={{
            fontSize: 14,
            color: colors.muted,
            marginTop: 3,
          }}
        >
          {label}
        </div>
      </div>

      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color,
        }}
      >
        {known ? `${count}d` : "N/A"}
      </span>
    </div>
  );
};

export const render = ({ output, error }) => {
  const brewLine = (output || "").trim().split("\n")
    .find(line => line.startsWith("BREW|"));
  const [, days, status] = !error && brewLine
    ? brewLine.split("|")
    : ["BREW", "0", "UNKNOWN"];

  return (
    <div
      style={{
        background: "#292929",
        padding: "20px",
        borderRadius: "28px",
        boxSizing: "border-box",
      }}
    >
      <HomebrewRow days={days} status={status} />
    </div>
  );
};
```
