// This code copied from https://badging-api.glitch.me/index.html.

// Update the UI to indicate whether the API is supported.
function isSupported(kind) {
  console.log('supported', kind);
  const divNotSupported = document.getElementById('notSupported');
  divNotSupported.classList.toggle('hidden', true);
  butSet.removeAttribute('disabled');
  butClear.removeAttribute('disabled');
  badgeVal.removeAttribute('disabled');  
}

// Wrapper to support first and second origin trial
// See https://web.dev/badging-api/ for details.
function setBadge(...args) {
if (navigator.setExperimentalAppBadge) {
    navigator.setExperimentalAppBadge(...args);
  } else if (window.ExperimentalBadge) {
    window.ExperimentalBadge.set(...args);
  }
}

// Wrapper to support first and second origin trial
// See https://web.dev/badging-api/ for details.
function clearBadge() {
  if (navigator.clearExperimentalAppBadge) {
    navigator.clearExperimentalAppBadge();
  } else if (window.ExperimentalBadge) {
    window.ExperimentalBadge.clear();
  }
}

document.addEventListener('DOMContentLoaded', ()=> {
  // Check if the API is supported.
  if ('setExperimentalAppBadge' in navigator) {
    isSupported('v2')
  }

  // Check if the previous API surface is supported.
  if ('ExperimentalBadge' in window) {
    isSupported('v1');
  }

  const butSet = document.getElementById('butSet');
  const butClear = document.getElementById('butClear');
  const badgeVal = document.getElementById('badgeVal');
  // Click event handler for Set button.
  butSet.addEventListener('click', () => {
    const val = parseInt(badgeVal.value, 10);
    if (isNaN(val)) {
      setBadge();
      return;
    }
    setBadge(val);
  });
  
  // Click event handler for Clear button.
  butClear.addEventListener('click', () => {
    clearBadge();
  });
  
  // On page load, set the badge to a simple flag.
  window.addEventListener('load', () => {
    const val = parseInt(badgeVal.value, 10);
    if (isNaN(val)) {
      setBadge();
      return;
    }
    setBadge(val);
  });
})