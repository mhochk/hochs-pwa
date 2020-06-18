function show_activaton_type(type) {
    // document.body.styleSheets.insertRule(".activation_type { display;none}", 0);
    let el = document.getElementById(type);
    if (!el)
        return;

    el.style.display = 'block';
}

function activate_navigate() {
    show_activaton_type("launch");
}

function debugPost() {
    var formData = new FormData();
    formData.append("textName", "textValue");
    const file_input = document.querySelector('#files');
    const files = file_input.disabled ? undefined : file_input.files;
    if (files && files.length > 0) {
        formData.append("aFile", files[0]);
        formData.append("allFiles", files);
    }
    var request = new XMLHttpRequest();
    request.open("POST", "https://mhochk.github.io/hochs-pwa/?fromDebugPost");
    request.send(formData);
}

function activate_shared(searchParams) {
    show_activaton_type("share");
    const title = searchParams.get("title");
    const text = searchParams.get("text");
    const url = searchParams.get("url");
    document.getElementById("shared_from").innerHTML += "Title: " + title + "<br>";
    text ? document.getElementById("shared_from").innerHTML += "Text: " + text + "<br>": text;
    url ? document.getElementById("shared_from").innerHTML += "Url: " + url + "<br>" : url;
}

// function activate_filehandler(searchParams) {
//     show_activaton_type("file");

//     // Read file
//     let file = searchParams.get("file");
//     if (!file) {
//         console.log("file handler activation doesn't have 'file' query");
//         return;
//     }

//     if (!window.chooseFileSystemEntries){
//         console.log("native file system isn't supported");
//         return;
//     }

//     async function getNewFileHandle() {
//         const opts = {
//             type: 'openFile', // save-file, open-directory
//             accepts: [
//                 {
//                     description: 'MY File',
//                     extensions: ['txt2'], // file handler in the manifest.
//                     // mimeTypes: ['text/plain'],
//                 },
//                 {
//                     description: 'Txt3 file',
//                     extensions: ['txt3'], // file handler in the manifest.
//                     // mimeTypes: ['text/plain'],
//                 },
//                 {
//                     description: 'You file',
//                     extensions: ['txt4'], // file handler in the manifest.
//                     // mimeTypes: ['text/plain'],
//                 },
                
//             ],
//         };
//         const handle = await window.chooseFileSystemEntries(opts);
//         const file = await handle.getFile();
//         const contents = await file.text();
//         return contents;
//     }

//     let file_open_btn = document.createElement('button');
//     file_open_btn.innerHTML = "Open File";
    
//     let file_name = document.createElement('div');
//     file_name.innerHTML = "choose file: " + file;
//     file_activation.appendChild(file_name);
//     file_activation.appendChild(file_open_btn);

//     file_open_btn.addEventListener('click', () => {
//         getNewFileHandle().then((contents) => {
//             var element = document.getElementById('file_handler');
//             element.innerHTML = contents;
//             document.getElementsByClassName('filetype')[0].style.visibility = 'visible';
//         })
//     });
// }

function activate_filehandler(searchParams) {
    const win32 = searchParams.get("win32");
    if (win32) {
        // content uri; onedrive
        let cotenturi = document.createElement('div');
        cotenturi.innerHTML = "win32=" + win32;
        document.getElementById('file').appendChild(win32);
    }

    const conflict = searchParams.get("conflict");
    if (conflict) {
        // content uri; onedrive
        let cotenturi = document.createElement('div');
        cotenturi.innerHTML = "content_uri=" + conflict;
        document.getElementById('file').appendChild(conflict);
    }
    const content_uri = searchParams.get("contenturi");
    if (content_uri) {
        // content uri; onedrive
        let cotenturi = document.createElement('div');
        cotenturi.innerHTML = "content_uri=" + content_uri;
        document.getElementById('file').appendChild(cotenturi);

        // content_uri can't be mixed with local file opening below.
        let uri_open = document.createElement('button');
        uri_open.innerHTML = "window.open(" + content_uri + ")";
        uri_open.id = "content_uri_open";
        document.getElementById('file').appendChild(uri_open);
        uri_open.addEventListener('click', (e) => {
            window.open(content_uri);
        })

        return;
    }

    if (!('launchQueue' in window)) {
        console.log("launchQueue isn't supported");
        return;
    }

    if (!window.chooseFileSystemEntries){
        console.log("native file system isn't supported");
        return;
    }

    
    async function getContents(handle) {
        const file = await handle.getFile();
        const contents = await file.text();
        return contents;
    }

    async function writeTestContents(handle) {
        // Create a writer (request permission if necessary).
        const writer = await handle.createWriter();
        // Make sure we start with an empty file
        // await writer.truncate(0);
        // Write the full length of the contents
        await writer.write(0, "WRITTEN DYNAMICALLY WRITTEN DYNAMICALLY WRITTEN DYNAMICALLY");
        // Close the file and write the contents to disk
        await writer.close();
    }

    launchQueue.setConsumer(launchParams => {
        if (!launchParams.files.length) {
            console.log("launchQueue has 0 params");
            return;
        }

        const fileHandle = launchParams.files[0];
        getContents(fileHandle).then((contents) => {
            var element = document.getElementById('file_handler');
            element.innerHTML = contents;
            document.getElementsByClassName('filetype')[0].style.visibility = 'visible';

            writeTestContents(fileHandle);
        });

        // Handle the file:
        // https://github.com/WICG/native-file-system/blob/master/EXPLAINER.md#example-code
    });
}

document.addEventListener('DOMContentLoaded', ()=> {
    if ('serviceWorker' in navigator) { 
        navigator.serviceWorker.register('service-worker.js')
        .then ((reg) => { 
            console.log('serviceWorker.register successfully returned: ', reg); 
        }).catch((e) => { 
            console.error('serviceWorker.register returned failure: ', e); 
        }); 
    }

    if (!location.search.length) {
        return;
    }

    var search_params = new URLSearchParams(location.search);
    var custom_info = search_params.get("custom_param");
    if (custom_info === "start_url_value") {
        console.log("Launched to start_url");
    } else if (custom_info === "share_target_value") {
        console.log("Launched to share_target's action");
    } else if (custom_info === "csv_file_handler") {
        console.log("Launched to file_handler's action for the 'csv' related bucket");
    } else if (custom_info === "jpeg_file_handler") {
        console.log("Launched to file_handler's action for the 'jpeg' related bucket");
    } else if (custom_info === "graph_file_handler") {
        console.log("Launched to file_handler's action for the 'graph' related bucket");
    } else {
        console.warn("Launch missing custom_param - assuming browser launch");
    }
})


