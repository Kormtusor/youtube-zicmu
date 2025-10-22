// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// preload.ts
import titlebarHTML from './templates/titlebar/titlebar.html?raw';
import titlebarCSS from './templates/titlebar/titlebar.css?raw';

// Trusted Types policy variable
let defaultTrustedTypePolicy: TrustedTypePolicy | null = null;

function registerWindowDefaultTrustedTypePolicy() {
  if (window.trustedTypes && window.trustedTypes.createPolicy) {
    defaultTrustedTypePolicy = window.trustedTypes.createPolicy('default', {
      createHTML: (input) => input,
      createScriptURL: (input) => input,
      createScript: (input) => input,
    });
  }
}


//TODO: refacto clean in method ? + force police to prevent size change
window.addEventListener('DOMContentLoaded', () => {
  registerWindowDefaultTrustedTypePolicy();

  const safeHTML = defaultTrustedTypePolicy.createHTML(titlebarHTML);
  //TODO: would like to remove this
  const container = document.createElement('div');
  container.innerHTML = safeHTML;
  document.body.prepend(container);

  const style = document.createElement('style');
  style.textContent = titlebarCSS;
  document.head.appendChild(style);
});
