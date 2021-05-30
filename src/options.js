function onError(error){
    console.error('Error: ' + error);
}

/*function loadOptions(){
    //browser.storage.local.set({showFaculty: true, courseId: false});
    let getting = browser.storage.local.get([
        "showFaculty", "courseId"
    ]);
    getting.then(a => {
        document.querySelector("#faculty").checked = a.showFaculty || false;
        document.querySelector("#courseId").checked = a.courseId || false;
    }, onError);
}*/

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

document.addEventListener("DOMContentLoaded", () => {
    let getting = browser.storage.local.get([
        "showFaculty", "courseId"
    ]);
    getting.then(a => {
        document.querySelector("#faculty").checked = a.showFaculty || false;
        document.querySelector("#courseId").checked = a.courseId || false;
    }, onError);
});

document.querySelector("#faculty").addEventListener('change', () => {
    const checkbox = document.querySelector("#faculty");
    browser.storage.local.set({showFaculty: checkbox.checked});
    //document.body.style.border = "10px solid " + getRandomColor();   
});

document.querySelector("#courseId").addEventListener('change', () => {
    const checkbox = document.querySelector("#courseId");
    browser.storage.local.set({courseId: checkbox.checked}); 
});
