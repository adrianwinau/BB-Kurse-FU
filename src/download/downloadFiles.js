function clearName(str){
    return [...str.matchAll(/[A-Za-z0-9]+/g)].join("_").slice(0,64);
}

async function downloadFolder(html){
    if (!isDownloading) return [];
    let folder = [];
    let liItems = html.querySelectorAll("#content_listContainer > li");
    for (let element of liItems) {
        if (!isDownloading) return [];
        let imgSrc = element.querySelector(".item_icon").src.split("/").pop();
        let folderPath = Array.from(html.querySelectorAll("ol.clearfix > li"));
        folderPath.splice(0,2);
        let courseName = clearName(html.querySelector(".courseName").innerText);
        let parentPath = courseName + "/";
        for (el of folderPath ){
            parentPath += clearName(el.innerText) + "/";
        }

        let filesToDownload = []; // item: [urlDiv, optional_addition_to_path OR null, fileEnding]
        if (imgSrc.includes("folder")){
            let name = clearName(element.querySelector("h3").innerText);
            let url = element.querySelector("a");
            folder.push({name, url});
            let msg = {
                mode: "blob",
                input: [element.innerText],
                blobOptions: {type: "text/plain"},
                filename: parentPath + name + "/_description.txt",
            };
            if (isDownloading) myPort.postMessage(msg);
            continue;
        } else if (imgSrc.includes("document")){
            //set of documents, with description (will be stored as _discription.txt)
            let parent = clearName(element.querySelector("h3").innerText) + "/";
            for( let link of element.querySelectorAll("a")){
                if(!link.className) filesToDownload.push([link, parent]);
            }
            let msg = {
                mode: "blob",
                input: [element.innerText],
                blobOptions: {type: "text/plain"},
                filename: parentPath + parent + "_description.txt",
            };
            if (isDownloading) myPort.postMessage(msg);
            
        } else if (imgSrc.includes("file") || imgSrc.includes("link")){
            // only a file/link without description
            let urlDiv = element.querySelector("a");
            filesToDownload.push([urlDiv, null]);
        } else {
            let msg = {
                mode: "blob",
                input: [element.innerText],
                blobOptions: {type: "text/plain"},
                filename: parentPath + clearName(element.querySelector("h3").innerText) + ".txt",
            };
            if (isDownloading) myPort.postMessage(msg);
            continue;
        }

        for(file of filesToDownload){
            let urlDiv = file[0];
            let path = parentPath;
            if (file[1] != null) path = parentPath + file[1];

            if (urlDiv.href.includes("bbcswebdav")){
                var response = await fetch(urlDiv.href);
                let fileName = decodeURI(response.url.split("/").pop());
                let fileExtension = fileName.split(".").pop()
                fileName = clearName(fileName.replace(fileExtension, ""));
                fileName = [fileName, fileExtension].join(".");

                var msg = {
                    mode: "download",
                    url: response.url,
                    filename: path + fileName,
                };

                if (isDownloading) myPort.postMessage(msg);
            } else {
                //console.warn("Keine Datei oder nicht von FU Berlin", urlDiv.href);
                let fileName;
                try{
                    fileName = clearName(urlDiv.innerText.split("//").pop()) + ".html";
                } 
                catch {
                    fileName = clearName(urlDiv.innerText) + ".html"; 
                }
                
                var msg = {
                    mode: "blob",
                    input: ["<html><head><meta http-equiv=\"refresh\" content=\"0; URL=\'" + urlDiv.href + "\'\" /></head></html>"],
                    blobOptions: {type: "text/html"},
                    filename: path + fileName,
                };
                if (isDownloading) myPort.postMessage(msg);
            }
        }
    }
    return folder;
}

async function startDownloading(){
    if (isDownloading) {
        isDownloading = false;
        downloadBtn.innerText = "Alle Dateien herunterladen";
        myPort.postMessage({mode: "abort"});
        runningDiv.style.display = "none";
        finallySymbolDiv.style.display = "none";
        return;
    }
    isDownloading = true;
    downloadBtn.innerText = "Download abbrechen";
    runningDiv.style.display = "unset";
    finallySymbolDiv.style.display = "none";
    let folderStack = await downloadFolder(document);
    
    while (folderStack.length > 0 && isDownloading){
        currentFolder = folderStack.shift();
        let parser = new DOMParser();
        
        let text = await (await fetch(currentFolder.url)).text();
        let html = parser.parseFromString(text, "text/html");

        let b = await downloadFolder(html);
        for (el of b) { folderStack.push(el); }
    }
    
    if(isDownloading){
        isDownloading = false;
        myPort.postMessage({mode: "end"});
        downloadBtn.innerText = "Alle Dateien herunterladen";
        runningDiv.style.display = "none";
        finallySymbolDiv.style.display = "unset";
    }
    return;
}

//TODO: this file is currently disabled
return;

let isDownloading = false;
let myPort, runningDiv, finallySymbolDiv, downloadBtn;

if(!navigator.userAgent.toLowerCase().includes("firefox")) browser = chrome;

browser.storage.sync.get([
    "showDownloadBtn"
], a => {
    if(!a.showDownloadBtn) return;

    myPort = browser.runtime.connect({name:"port-from-cs"});
    //myPort.postMessage({greeing: "hello from content script", folderList: false});

    myPort.onMessage.addListener(m => {
        console.log("Int content script, received message from background script: ");
        try{ console.log(m.greeting); }
        catch (ignore) {} 
        if(m.error)
            console.log(m.error);
    });

    let = loaderCss = document.createElement("link");
    loaderCss.rel = "stylesheet"; loaderCss.type = "text/css";
    loaderCss.href = browser.runtime.getURL("download/download.css");
    document.querySelector("head").appendChild(loaderCss);

    let titleDiv = document.getElementById("pageTitleDiv");
    downloadBtn = document.createElement("button");
    downloadBtn.innerText = "Alle Dateien herunterladen";
    downloadBtn.id = "downloadAll"
    titleDiv.appendChild(downloadBtn);

    runningDiv = document.createElement("div");
    runningDiv.className = "loader";
    titleDiv.appendChild(runningDiv);

    finallySymbolDiv = document.createElement("span"); finallySymbolDiv.className = "checkmark";
    for (className of ["checkmark_circle", "checkmark_stem", "checkmark_kick"]){
        let div = document.createElement("div");
        div.className = className;
        finallySymbolDiv.appendChild(div);
    }
    titleDiv.appendChild(finallySymbolDiv);

    runningDiv.style.display = "none";
    finallySymbolDiv.style.display = "none";

    document.getElementById("downloadAll").addEventListener("click", startDownloading);
});