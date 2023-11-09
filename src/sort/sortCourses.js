const COURSEID = "_183_1termCourses_noterm";
const COURSDIVCLASS = "portletList-img courseListing coursefakeclass ";
const SEMESTERPATTERN = /[0-9][0-9][SW]/;

class PriorityQueue {
    // Source: https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
    constructor(comparator = (a, b) => a > b) {
        this._heap = [];
        this._comparator = comparator;
        this.TOP = 0;
    }
    parent(i){
        return ((i + 1) >>> 1) - 1;
    }
    left(i){
        return (i << 1) + 1;
    }
    right(i) {
        return (i + 1) << 1;
    }
    size() {
        return this._heap.length;
    }
    isEmpty() {
        return this.size() == 0;
    }
    peek() {
        return this._heap[this.TOP];
    }
    push(...values) {
        values.forEach(value => {
            this._heap.push(value);
            this._siftUp();
        });
        return this.size();
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > this.TOP) {
            this._swap(this.TOP, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }
    replace(value) {
        const replacedValue = this.peek();
        this._heap[this.TOP] = value;
        this._siftDown();
        return replacedValue;
    }
    _greater(i, j) {
        return this._comparator(this._heap[i], this._heap[j]);
    }
    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
    _siftUp() {
        let node = this.size() - 1;
        while (node > this.TOP && this._greater(node, this.parent(node))) {
            this._swap(node, this.parent(node));
            node = this.parent(node);
        }
    }
    _siftDown() {
        let node = this.TOP;
        while (
            (this.left(node) < this.size() && this._greater(this.left(node), node)) ||
            (this.right(node) < this.size() && this._greater(this.right(node), node))
        ) {
            let maxChild = (this.right(node) < this.size() && this._greater(this.right(node), this.left(node))) ? this.right(node) : this.left(node);
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}

function printSemester(semester) {
    let year = "20" + semester.substr(0, 2);
    let nextYear = (parseInt(semester.substr(0, 2))+1).toString();
    if (semester.charAt(2) == 'S') {
        return "Sommersemester " + year;
    } else if (semester.charAt(2) == 'W') {
        return "Wintersemester " + year + "/" + nextYear;
    }
    return "Sonstige Kurse";
}

function waitForElement(elementId, callBack, counter) {
    //Source: https://stackoverflow.com/questions/16791479/how-to-wait-for-div-to-load-before-calling-another-function
    if (++counter > 25) return;
    window.setTimeout(() => {
        if (document.getElementById(elementId))
            callBack();
        else
            waitForElement(elementId, callBack, counter);
    }, 50);
}

function main() {
    let courseDiv = document.getElementById(COURSEID).getElementsByTagName('ul')[0];
    let courseList = courseDiv.querySelectorAll("#" + COURSEID + " > ul > li");

    let courses = new PriorityQueue((a, b) => {
        if (sortFachbereich && a[1] == b[1]) {
            if ( a[3] == b[3]){
                return a[2] <= b[2];
            }
            return a[3] <= b[3]
        } else if (a[1] == b[1]){
            return a[2] <= b[2];
        }
        return a[1] >= b[1];
    });

    for (i = 0; i < courseList.length; i++) {
        let courseText = courseList[i].getElementsByTagName('a')[0].innerText;
        let id = courseText.substring(0, courseText.indexOf(':'));
        let kursName = courseText.substring(courseText.indexOf(':')+1, courseText.length).trim();
        courseList[i].getElementsByTagName('a')[0].innerText = kursName;
        if( kursName.includes(')') ) {
            kursName = kursName.substring(kursName.indexOf(')')+1,kursName.length).trim();
        }
        let fachbereich = id.substring(0, id.indexOf('_'));
        if(showId){
            let idDiv = document.createElement('div');
            id.className = "bb-kurse-iddiv";
            let spanTitle = document.createElement('span');
            spanTitle.className = "bb-kurse-idTitle"; 
            spanTitle.innerText = "ID: ";
            let spanText = document.createElement('span');
            spanText.className = "bb-kurse-idText";
            spanText.innerText = id + ";  ";
            idDiv.appendChild(spanTitle).appendChild(spanText);
            if(showVvLink){
                let vvLink = document.createElement("a");
                vvLink.href = "https://www.fu-berlin.de/vv/de/search?utf8=✓&query=" + id.match(/[0-9]+/);
                vvLink.title = "Link zum VV (Vorlesungsverzeichnis)";
                vvLink.target = "_blank";
                vvLink.className = "bb-kurse-vvlink";
                idDiv.appendChild(vvLink);
            }
            courseList[i].appendChild(idDiv);
        }
        let x = [
            courseList[i],
            id.substring(id.length - 3, id.length), // Semester
            kursName, // Name
            fachbereich
        ];
        if (!SEMESTERPATTERN.test(x[1])) {
            x[1] = '00A';
        }
        courses.push(x);
    }

    let semester = "Sonstiges"
    let fachbereich = "";
    let newCoursesDiv = document.createElement("ul");
    newCoursesDiv.className = COURSDIVCLASS;

    while (!courses.isEmpty()) {
        let x = courses.pop();
        if (!(semester === x[1])) {
            semester = x[1];
            let h2 = document.createElement("h2");
            h2.className = "bb-kurse-semester";
            h2.innerText = printSemester(semester);
            fachbereich = "";
            newCoursesDiv.appendChild(h2);
        }
        if(!(fachbereich === x[3]) && sortFachbereich){
            fachbereich = x[3];
            let h3 = document.createElement("h3");
            h3.innerText = fachbereich;
            h3.className = "bb-kurse-fbname";
            newCoursesDiv.appendChild(h3);
        }
        newCoursesDiv.appendChild(x[0]);
    }
    courseDiv.parentNode.replaceChild(newCoursesDiv, courseDiv);
}

let sortFachbereich = showId = sortCourses = showVvLink = false;

if(!navigator.userAgent.toLowerCase().includes("firefox")) browser = chrome;

// loaderCss = document.createElement("link");
// loaderCss.rel = "stylesheet"; loaderCss.type = "text/css";
// loaderCss.href = browser.runtime.getURL("sort/sort.css");
// document.querySelector("head").appendChild(loaderCss);

// wait till COURSEID 
waitForElement(COURSEID, () => {
    browser.storage.sync.get([
        "sortCourses",
        "showFaculty",
        "showCourseId",
        "showVvLink",
    ]).then( a => {
        // console.log(a);
        sortCourses = a.sortCourses;
        sortFachbereich = a.showFaculty;
        showId = a.showCourseId;
        showVvLink = a.showVvLink;
        if(sortCourses) main();
    });
}, 0);