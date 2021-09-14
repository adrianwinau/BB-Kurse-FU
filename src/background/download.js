function onStartedDownload(id) {
    portFromCS.postMessage({greeting: `Started downloading: ${id}`});
}

function onFailed(error) {
    portFromCS.postMessage({error: `Download failed: ${error}`});
}

function downloadFile(url, filename){
    portFromCS.postMessage({greeting: "downloading...\n" + filename + "\n" + url});

    browser.downloads.download({
        url: url,
        filename: filename,
        saveAs: false,
        conflictAction: "overwrite",
    }, id => {
        if (id == undefined) onerror("error beim downlaod");
        else onStartedDownload(id);
    });
}

function readMessage(opt){
    switch (opt.mode) {
        case "download":
            downloadFile(opt.url, opt.filename);
            break;
        case "blob":
            var blob = new Blob(opt.input, opt.blobOptions);
            var url = URL.createObjectURL(blob);
            downloadFile(url, opt.filename);            
            break;
        case "abort":
            portFromCS.postMessage({greeting: "ABRUCH !!!! "});
            browser.downloads.search({
                state: "in_progress",
            }, downloads => {
                for(download of downloads){
                    browser.downloads.cancel(download.id);
                }
            });
            break;
        case "end":
            browser.downloads.showDefaultFolder();
            break;
        default:
            portFromCS.postMessage({greeting: "in BS: !!!! No correct mode !!!"});
    }
}

let portFromCS;
if(!navigator.userAgent.toLowerCase().includes("firefox")) browser = chrome;

browser.runtime.onConnect.addListener(p => {
    portFromCS = p;
    portFromCS.postMessage({greeting: "in BS: hi there content script!"});
    portFromCS.onMessage.addListener(readMessage);
});

browser.downloads.onChanged.addListener( delta => {
    switch (delta.state.current) {
        case "complete":
            var id = delta.id;
            browser.downloads.search({id}, downloads => {
                for (let download of downloads){
                    if(download.url.toString().includes("blob")){
                        portFromCS.postMessage({greeting: "revoke: " + download.url});
                        URL.revokeObjectURL(download.url);
                    }
                }
            });
            break;
        case "interrupted":
            var error = delta.error;
            portFromCS.postMessage({error: `error on download: ${error.previous} jetzt: ${error.current} \n ${delta.url}`});
            break;
            var id = delta.id;
            browser.downloads.search({id}, downloads => {
                for (let download of downloads){
                    
                    if(download.url.toString().includes("blob")){
                        portFromCS.postMessage({greeting: "revoke: " + download.url});
                        URL.revokeObjectURL(download.url);
                    }
                }
            });
            break;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    browser.storage.sync.get([
        "sortCourses", "showFaculty", "showCourseId", "showVvLink", "showDownloadBtn"
    ], a => {
        if(!("sortCourses" in a)) browser.storage.sync.set({sortCourses: true});
        if(!("showFaculty" in a)) browser.storage.sync.set({showFaculty: true});
        if(!("showCourseId" in a)) browser.storage.sync.set({showCourseId: true});
        if(!("showVvLink" in a)) browser.storage.sync.set({showVvLink: true});
        if(!("showDownloadBtn" in a)) browser.storage.sync.set({showDownloadBtn: true});
    });
});