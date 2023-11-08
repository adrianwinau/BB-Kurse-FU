function updateList() {
    for (li of Array.from(document.querySelectorAll("li"))) {
        let currentBox = li.querySelector("input");
        if (currentBox.disabled) continue;
        let checked = currentBox.checked;
        for (checkbox of Array.from(li.querySelectorAll("input")).slice(1)) {
            checkbox.disabled = !checked;
        }
    }
}

function changeCheckbox(id) {
    const checkbox = document.querySelector(`#${id}`);
    browser.storage.sync.set(JSON.parse(`{"${id}":${checkbox.checked}}`));
    updateList();
}

if (!navigator.userAgent.toLowerCase().includes("firefox")) browser = chrome;


document.addEventListener("DOMContentLoaded", () => {
    browser.storage.sync.get([
        "sortCourses",
        "showFaculty",
        "showCourseId",
        "showVvLink",
        // "showDownloadBtn",
    ], a => {
        document.querySelector("#sortCourses").checked = a.sortCourses || false;
        document.querySelector("#showFaculty").checked = a.showFaculty || false;
        document.querySelector("#showCourseId").checked = a.showCourseId || false;
        document.querySelector("#showVvLink").checked = a.showVvLink || false;
        // document.querySelector("#showDownloadBtn").checked = a.showDownloadBtn || false;
        // document.querySelector("#showDownloadBtn").checked = false;

        updateList();
    });
});

document.querySelector("#showFaculty").addEventListener("change", () => changeCheckbox("showFaculty"));
document.querySelector("#showCourseId").addEventListener("change", () => changeCheckbox("showCourseId"));
document.querySelector("#sortCourses").addEventListener("change", () => changeCheckbox("sortCourses"));
// document.querySelector("#showDownloadBtn").addEventListener("change", () => changeCheckbox("showDownloadBtn"));
document.querySelector("#showVvLink").addEventListener("change", () => changeCheckbox("showVvLink"));