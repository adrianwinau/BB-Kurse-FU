function onError(error){
    console.error('Error: ' + error);
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
});

document.querySelector("#courseId").addEventListener('change', () => {
    const checkbox = document.querySelector("#courseId");
    browser.storage.local.set({courseId: checkbox.checked}); 
});
