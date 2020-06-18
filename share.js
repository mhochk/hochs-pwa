// Base code comes from http://wicg.github.io/web-share/demos/share-files.html

'use strict';

function sleep(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

function logText(message, isError) {
  if (isError)
    console.error(message);
  else
    console.log(message);

  const p = document.createElement('p');
  if (isError)
    p.setAttribute('class', 'error');
  document.querySelector('#output').appendChild(p);
  p.appendChild(document.createTextNode(message));
}

function logError(message) {
  logText(message, true);
}

function checkboxChanged(e) {
  const checkbox = e.target;
  const textfield = document.querySelector('#' + checkbox.id.split('_')[0]);

  textfield.disabled = !checkbox.checked;
  if (!checkbox.checked)
    textfield.value = '';
}

async function testWebShare() {
  if (navigator.share === undefined) {
    logError('Error: Unsupported feature: navigator.share()');
    return;
  }

  const title_input = document.querySelector('#title');
  const text_input = document.querySelector('#text');
  const url_input = document.querySelector('#url');
  const file_input = document.querySelector('#files');

  const title = title_input.disabled ? undefined : title_input.value;
  const text = text_input.disabled ? undefined : text_input.value;
  const url = url_input.disabled ? undefined : url_input.value;
  const files = file_input.disabled ? undefined : file_input.files;

  if (files && files.length > 0) {
    if (!navigator.canShare || !navigator.canShare({files})) {
      logError('Error: Unsupported feature: navigator.canShare()');
      return;
    }
  }

  try {
    await navigator.share({
      files: files,
      title: title,
      text: text,
      url: url
    });

    logText('Successfully sent share and receive');
  } catch (error) {
    logError('Error sharing: ' + error);
  }
}

async function testWebShareDelay() {
  await sleep(6000);
  testWebShare();
}

function onLoad() {
  // Checkboxes disable and delete textfields.
  document.querySelector('#title_checkbox').addEventListener('click',
      checkboxChanged);
  document.querySelector('#text_checkbox').addEventListener('click',
      checkboxChanged);
  document.querySelector('#url_checkbox').addEventListener('click',
      checkboxChanged);

  document.querySelector('#share').addEventListener('click', testWebShare);
  document.querySelector('#share-no-gesture').addEventListener('click',
      testWebShareDelay);

  if (navigator.share === undefined) {
    logError('Error: You need to use a browser that supports this draft ' +
              'proposal.');
  }
}

window.addEventListener('load', onLoad);
