document.querySelectorAll('div.highlighter-rouge').forEach(block => {
  const language = [...block.classList]
    .find(name => name.startsWith('language-'));

  if (language) {
    block.dataset.language = language.replace('language-', '');
  }

  const pre = block.querySelector('pre');
  if (!pre) return;

  const button = document.createElement('button');
  button.className = 'copy-code';
  button.textContent = 'TAP TO COPY';

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pre.textContent);
      button.textContent = 'COPIED!';
    } catch {
      button.textContent = 'FAILED';
    }

    setTimeout(() => {
      button.textContent = 'TAP TO COPY';
    }, 500);
  });

  block.appendChild(button);
});
