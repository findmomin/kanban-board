var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// dom elements
var elements = {
    addBtns: __spreadArray([], document.querySelectorAll('.add-btn:not(.solid)'), true),
    saveItemBtns: __spreadArray([], document.querySelectorAll('.solid'), true),
    addItemContainers: document.querySelectorAll('.add-container'),
    addItems: document.querySelectorAll('.add-item'),
    // Item Lists
    listColumns: __spreadArray([], document.querySelectorAll('.drag-item-list'), true),
    backlogListEl: document.getElementById('backlog-list'),
    progressListEl: document.getElementById('progress-list'),
    completeListEl: document.getElementById('complete-list'),
    onHoldListEl: document.getElementById('on-hold-list')
};
var swapConfig = {
    firstArr: {
        arrIndexOne: 0,
        elementIndexOne: 0
    },
    secondArr: {
        arrIndexTwo: 0,
        elementIndexTwo: 0
    }
};
var isBeingDragged = false;
var Board = /** @class */ (function () {
    function Board(title, target) {
        this.title = title;
        this.target = target;
        this.items = [];
        this.titleEl = target.querySelector('h1');
        this.addBtn = target.querySelector('.add-btn');
        this.saveBtn = target.querySelector('.add-btn.solid');
        this.addContainer = target.querySelector('.add-container');
        this.textBox = target.querySelector('.add-item');
        this.itemsListEl = target.querySelector('.drag-item-list');
        // assigning the title
        this.titleEl.textContent = title;
    }
    // displays the textbox upon clicking add item btn
    Board.prototype.displayTextbox = function () {
        // show the textbox & add save item btn
        [this.saveBtn, this.addContainer].forEach(function (btn) {
            return btn.classList.add('flex');
        });
        // hide the add item btn
        this.addBtn.classList.add('hidden');
    };
    // saves the item
    Board.prototype.saveItem = function (item) {
        this.items.push(item);
        // update the dom
        [this.saveBtn, this.addContainer].forEach(function (btn) {
            return btn.classList.remove('flex');
        });
        this.addBtn.classList.remove('hidden');
        this.textBox.textContent = '';
        saveBoards();
        console.log(this.items);
    };
    Board.prototype.renderItems = function () {
        var _this = this;
        this.itemsListEl.innerHTML = '';
        this.items.forEach(function (item, i) {
            return _this.itemsListEl.insertAdjacentHTML('beforeend', "\n        <li id=\"" + i + "\" class=\"drag-item\" draggable=\"true\" ondragover=\"event.preventDefault()\" contenteditable=\"true\">\n          " + item + "\n        </li>\n        ");
        });
    };
    Board.prototype.updateItem = function (indexOfItem, update) {
        if (isBeingDragged)
            return;
        if (!update.length)
            this.items.splice(indexOfItem, 1);
        else
            this.items[indexOfItem] = update;
        this.renderItems();
        saveBoards();
    };
    return Board;
}());
// All boards
var boards = [
    new Board('Backlog', document.querySelector('.backlog-column')),
    new Board('In Progress', document.querySelector('.progress-column')),
    new Board('Complete', document.querySelector('.complete-column')),
    new Board('On Hold', document.querySelector('.on-hold-column')),
];
// functions
// returns the index of an element in an array
var indexOfEl = function (el, arr) { return arr.indexOf(el); };
// swaps two elements of any array or the same array
var swapElements = function (config) {
    var _a = config.firstArr, arrIndexOne = _a.arrIndexOne, elementIndexOne = _a.elementIndexOne;
    var _b = config.secondArr, arrIndexTwo = _b.arrIndexTwo, elementIndexTwo = _b.elementIndexTwo;
    var elementOne = boards[arrIndexOne].items[elementIndexOne];
    var elementTwo = boards[arrIndexTwo].items[elementIndexTwo];
    // if the drag and drop occured in the same board, then swap els
    if (arrIndexOne === arrIndexTwo) {
        boards[arrIndexOne].items[elementIndexOne] = elementTwo;
        boards[arrIndexTwo].items[elementIndexTwo] = elementOne;
    }
    // if the drag and drop occured in different board, them move el
    else
        console.log(elementOne, elementTwo);
    // save the boards
    saveBoards();
    // re-render the boards
    boards[arrIndexOne].renderItems();
    boards[arrIndexTwo].renderItems();
};
// saves the boards to localStorage
var saveBoards = function () {
    boards.forEach(function (board, i) {
        return localStorage.setItem("board" + i, JSON.stringify(board.items));
    });
};
// renders saved boards
var retriveBoards = function () {
    boards.forEach(function (board, i) {
        // check if there's a saved board
        localStorage.getItem("board" + i)
            ? (board.items = JSON.parse(localStorage.getItem("board" + i)))
            : null;
        // render the items of the board
        boards[i].renderItems();
    });
};
retriveBoards();
// event listeners
// Add item handler
elements.addBtns.forEach(function (btn) {
    return btn.addEventListener('click', function (e) {
        var index = indexOfEl(e.target.closest('.add-btn'), elements.addBtns);
        boards[index].displayTextbox();
    });
});
// save item handler
elements.saveItemBtns.forEach(function (btn) {
    return btn.addEventListener('click', function (e) {
        var index = indexOfEl(e.target.closest('.solid'), elements.saveItemBtns);
        var item = boards[index].textBox.textContent;
        // save the typed in text
        if (item.length) {
            boards[index].saveItem(item);
            boards[index].renderItems();
        }
    });
});
// update an item
elements.listColumns.forEach(function (list) {
    return list.addEventListener('focusout', function (e) {
        var target = e.target;
        var index = indexOfEl(target.parentNode, elements.listColumns);
        var id = target.id, update = target.textContent;
        boards[index].updateItem(+id, update === null || update === void 0 ? void 0 : update.trim());
    });
});
// drag handler
elements.listColumns.forEach(function (list) {
    return list.addEventListener('dragstart', function (e) {
        var target = e.target;
        // indexes of the first element
        swapConfig.firstArr.arrIndexOne = elements.listColumns.indexOf(target.parentNode);
        swapConfig.firstArr.elementIndexOne = +target.id;
        isBeingDragged = false;
    });
});
// dragover handler
// drop handler
elements.listColumns.forEach(function (list) {
    return list.addEventListener('drop', function (e) {
        var target = e.target;
        // indexes of the second element
        swapConfig.secondArr.arrIndexTwo = elements.listColumns.indexOf(target.parentNode);
        swapConfig.secondArr.elementIndexTwo = +target.id;
        isBeingDragged = true;
        swapElements(swapConfig);
    });
});
