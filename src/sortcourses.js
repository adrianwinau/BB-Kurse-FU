const courseId = "_183_1termCourses_noterm";
const coursDivClass = "portletList-img courseListing coursefakeclass ";
const semsterpattern = /[0-9][0-9][SW]/;


const top = 0;
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

var sortFachbereich = false;
var showId = false;

class PriorityQueue {
    // Source: https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
    constructor(comparator = (a, b) => a > b) {
        this._heap = [];
        this._comparator = comparator;
    }
    size() {
        return this._heap.length;
    }
    isEmpty() {
        return this.size() == 0;
    }
    peek() {
        return this._heap[top];
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
        if (bottom > top) {
            this._swap(top, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }
    replace(value) {
        const replacedValue = this.peek();
        this._heap[top] = value;
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
        while (node > top && this._greater(node, parent(node))) {
            this._swap(node, parent(node));
            node = parent(node);
        }
    }
    _siftDown() {
        let node = top;
        while (
            (left(node) < this.size() && this._greater(left(node), node)) ||
            (right(node) < this.size() && this._greater(right(node), node))
        ) {
            let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}

var options = new Promise(resolve =>{
    let getting = browser.storage.local.get([
        "showFaculty", "courseId"
    ]);
    getting.then(a => {
        sortFachbereich = a.showFaculty || false;
        showId = a.courseId || false;
    }, error => {console.error('Error: ' + error)} );
    resolve();
});

function printSemster(semester) {
    let year = "20" + semester.substr(0, 2);
    let nextYear = (parseInt(semester.substr(0, 2))+1).toString();
    if (semester.charAt(2) == 'S') {
        return "Sommersemster " + year;
    } else if (semester.charAt(2) == 'W') {
        return "Wintersemster " + year + "/" + nextYear;
    }
    return "Sonstige Kurse";
}

let countStart = 0;
function waitForElement(elementId, callBack) {
  if (++countStart > 25){ return; }
    window.setTimeout(function() {
        var element = document.getElementById(elementId);
        if (element) {
            callBack(elementId, element);
        } else {
            waitForElement(elementId, callBack);
        }
    }, 200)
}

function main() {
    let courseDiv = document.getElementById(courseId).getElementsByTagName('ul')[0];
    let courseList = courseDiv.querySelectorAll("#" + courseId + " > ul > li");

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
            idDiv.style = ("text-indent: -16px; margin: 4px 0; padding: 0 0 0 16px;");
            let spanTitle = document.createElement('span');
            spanTitle.style="color: #777"; spanTitle.innerText = "ID: ";
            let spanText = document.createElement('span');
            spanText.style = "color: #000";
            spanText.innerText = id + ";";
            idDiv.appendChild(spanTitle).appendChild(spanText);
            courseList[i].appendChild(idDiv);
        }
        let x = [
            courseList[i],
            id.substring(id.length - 3, id.length), // Semster
            kursName, // Name
            fachbereich
        ];
        if (!semsterpattern.test(x[1])) {
            x[1] = '00A';
        }
        courses.push(x);
    }

    let semester = "Sonstiges"
    let fachbereich = "";
    let newCoursesDiv = document.createElement("ul");
    newCoursesDiv.className = coursDivClass;

    while (!courses.isEmpty()) {
        let x = courses.pop();
        if (!(semester === x[1])) {
            semester = x[1];
            let h2 = document.createElement("h2");
            h2.style = "margin: 30px 0 10px 0";
            h2.innerText = printSemster(semester);
            fachbereich = "";
            newCoursesDiv.appendChild(h2);
        }
        if(!(fachbereich === x[3]) && sortFachbereich){
            fachbereich = x[3];
            let h3 = document.createElement("h3");
            h3.innerText = fachbereich;
            newCoursesDiv.appendChild(h3);
        }
        newCoursesDiv.appendChild(x[0]);
    }
    courseDiv.parentNode.replaceChild(newCoursesDiv, courseDiv);

}

/*** run script ***/
waitForElement(courseId, () => {
    //Source: https://stackoverflow.com/questions/16791479/how-to-wait-for-div-to-load-before-calling-another-function
    options.then(main());
});