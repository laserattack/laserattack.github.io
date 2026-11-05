---
layout: post
title: Linux file permissions explainer
categories: [it, linux, tools]
---

> AI rewrote my [Perl script](https://github.com/laserattack/rights) in JavaScript.

A browser version of my Perl script for explaining file permissions.
Convert numeric permissions to symbolic notation and back, inspect the
permissions of the owner, group and others, and decode special bits.

Enter three or four octal digits (`755`, `0644`, `4755`) or a symbolic
string (`rwxr-xr-x`, `-rw-r-----`, `drwxrwxrwt+`).
The result updates as you type.

<noscript>
  <p>This interactive permissions explainer requires JavaScript. Enable it in your browser settings.</p>
</noscript>

<div id="permissions-tool" hidden>
  <label for="permissions-input">Permissions:</label>
  <input id="permissions-input" type="text" value="755" placeholder="755 or rwxr-xr-x" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="permissions-error">
  <p id="permissions-error" role="status"></p>
  <div id="permissions-result" aria-live="polite" aria-atomic="true"></div>
</div>

<script type="module">
const fileTypes = {
  '-': 'regular file', d: 'directory', l: 'symbolic link',
  p: 'named pipe (FIFO)', c: 'character device',
  b: 'block device', s: 'socket',
};

function parsePermissions(value) {
  const input = value.trim();
  let type = '';
  let suffix = '';
  let symbolic;
  if (/^[0-7]{3,4}$/.test(input)) {
    const digits = input.padStart(4, '0').split('').map(Number);
    symbolic = digits.slice(1).map((digit, i) => {
      const special = digits[0] & (4 >> i);
      const execute = digit & 1;
      return (digit & 4 ? 'r' : '-') + (digit & 2 ? 'w' : '-') +
        (special ? (i === 2 ? (execute ? 't' : 'T') : (execute ? 's' : 'S')) :
          (execute ? 'x' : '-'));
    }).join('');
  } else {
    const match = /^([-dlspcb]?)([r-][w-][xsS-][r-][w-][xsS-][r-][w-][xtT-])([+.]?)$/.exec(input);
    if (!match) return null;
    [, type, symbolic, suffix] = match;
  }
  const groups = [0, 3, 6].map(offset => symbolic.slice(offset, offset + 3));
  const digits = groups.map(group => (group[0] === 'r' ? 4 : 0) +
    (group[1] === 'w' ? 2 : 0) + (/[xst]/.test(group[2]) ? 1 : 0));
  const special = (/[sS]/.test(groups[0][2]) ? 4 : 0) +
    (/[sS]/.test(groups[1][2]) ? 2 : 0) + (/[tT]/.test(groups[2][2]) ? 1 : 0);
  return { type, suffix, symbolic, groups, digits, special,
    numeric: (special ? String(special) : '') + digits.join('') };
}

const tool = document.getElementById('permissions-tool');
if (tool) {
  const input = document.getElementById('permissions-input');
  const error = document.getElementById('permissions-error');
  const result = document.getElementById('permissions-result');
  const row = (list, label, text, code = false) => {
    const term = document.createElement('dt');
    term.textContent = label;
    const definition = document.createElement('dd');
    if (code) {
      const element = document.createElement('code');
      element.textContent = text;
      definition.append(element);
    } else definition.textContent = text;
    list.append(term, definition);
  };
  function update() {
    result.replaceChildren();
    error.textContent = '';
    input.removeAttribute('aria-invalid');
    if (!input.value.trim()) return;
    const permissions = parsePermissions(input.value);
    if (!permissions) {
      input.setAttribute('aria-invalid', 'true');
      error.textContent = 'Enter 3–4 digits from 0 to 7, or permissions such as rwxr-xr-x / drwxrwxrwt+.';
      return;
    }
    const { type, suffix, symbolic, groups, digits, special, numeric } = permissions;
    const list = document.createElement('dl');
    row(list, 'Symbolic', type + symbolic + suffix, true);
    row(list, 'Numeric', numeric, true);
    row(list, 'File type', fileTypes[type] || 'not specified');
    ['Owner', 'Group', 'Others'].forEach((label, i) => {
      const group = groups[i];
      const directory = type === 'd';
      const names = directory ? ['list names', 'modify entries', 'traverse directory'] :
        ['read', 'write', 'execute'];
      const enabled = [group[0] === 'r', group[1] === 'w', /[xst]/.test(group[2])];
      const explanation = names.map((name, bit) => enabled[bit] ? `${name} (+${4 >> bit})` : `${name}: no`);
      const ordinary = enabled.map((set, bit) => set ? 'rwx'[bit] : '-').join('');
      const specialSet = Boolean(special & (4 >> i));
      const specialNote = specialSet ?
        `; ${['SUID', 'SGID', 'sticky'][i]} enabled (${4 >> i} in the leftmost octal digit)` : '';
      row(list, label, `${group} — ordinary permissions: ${ordinary} = ${digits[i]}; ${explanation.join('; ')}${specialNote}`);
    });
    const bits = [];
    if (special & 4) bits.push('SUID (+4): an executable runs with the effective UID of its owner; ignored on directories in Linux');
    if (special & 2) bits.push(type === 'd' ?
      'SGID (+2): new files and subdirectories inherit the directory group; subdirectories also inherit SGID' :
      'SGID (+2): an executable runs with the effective GID of the file group');
    if (special & 1) bits.push('sticky (+1): deletion and renaming in a directory are restricted to the file owner, directory owner and privileged processes');
    row(list, 'Special bits', bits.length ? bits.join('. ') + '.' : 'not set');
    if (groups.some(group => /[ST]/.test(group[2]))) {
      row(list, 'Uppercase S / T', 'A special bit is set without the corresponding x permission. It does not grant execution or directory traversal by itself.');
    }
    row(list, 'GNU ls suffix', suffix === '+' ? 'additional access permissions, such as an ACL, are present' :
      suffix === '.' ? 'a security context is present, with no other additional access methods' : 'not specified');
    result.append(list);
  }
  input.addEventListener('input', update);
  update();
  tool.hidden = false;
}
</script>

# Reading permissions

The three groups of characters describe the owner, group and others:
`rwx r-x r-x`. Within each group, `r` means read (`4`), `w` means write (`2`),
`x` means execute (`1`), and `-` means that the permission is absent.
Add the values to get the digit: `rwx` = `4 + 2 + 1` = `7`.

For directories, the meanings differ: `r` allows listing names,
`w` allows modifying directory entries, and `x` allows traversing the
directory and accessing its contents. Creating or removing entries
normally requires both `w` and `x` on the directory.

An optional fourth digit on the left specifies the special bits:
SUID (`4`), SGID (`2`) and sticky (`1`). Lowercase `s` and `t` mean that
both the special bit and the corresponding `x` permission are set.
Uppercase `S` and `T` mean that the special bit is set but `x` is absent.

You can include a file type and a `+` or `.` suffix, as shown by GNU `ls -l`.
These are explained separately and do not contribute to the numeric mode.
The tool only parses the supplied string: it does not inspect actual files,
ACL entries, security contexts or effective access.

See also: [file permissions in GNU Coreutils](https://www.gnu.org/software/coreutils/manual/html_node/Mode-Structure.html).
