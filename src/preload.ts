// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// preload.ts
import titlebarHTML from './templates/titlebar/titlebar.html?raw';
import titlebarCSS from './templates/titlebar/titlebar.css?raw';
import type { TrustedTypePolicy } from 'trusted-types/lib';

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

//TODO: refacto clean in method ? + force police to prevent size change on youtube cookies request
window.addEventListener('DOMContentLoaded', () => {
  registerWindowDefaultTrustedTypePolicy();

  const safeHTML = defaultTrustedTypePolicy.createHTML(titlebarHTML);
  //TODO: would like to remove this
  const container = document.createElement('div');
  // @ts-ignore
  container.innerHTML = safeHTML;
  document.body.prepend(container);

  const style = document.createElement('style');
  style.textContent = titlebarCSS;
  document.head.appendChild(style);
});
