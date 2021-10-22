// dom elements
const elements = {
  addBtns: [
    ...(document.querySelectorAll(
      '.add-btn:not(.solid)'
    ) as NodeListOf<HTMLDivElement>),
  ],
  saveItemBtns: [
    ...(document.querySelectorAll('.solid') as NodeListOf<HTMLDivElement>),
  ],
  addItemContainers: document.querySelectorAll(
    '.add-container'
  ) as NodeListOf<HTMLDivElement>,
  addItems: document.querySelectorAll(
    '.add-item'
  ) as NodeListOf<HTMLDivElement>,
  // Item Lists
  listColumns: [
    ...(document.querySelectorAll(
      '.drag-item-list'
    ) as NodeListOf<HTMLUListElement>),
  ],
  backlogListEl: document.getElementById('backlog-list') as HTMLUListElement,
  progressListEl: document.getElementById('progress-list') as HTMLUListElement,
  completeListEl: document.getElementById('complete-list') as HTMLUListElement,
  onHoldListEl: document.getElementById('on-hold-list') as HTMLUListElement,
};

// global variables
interface Swap {
  firstArr: {
    arrIndexOne: number;
    elementIndexOne: number;
  };
  secondArr: {
    arrIndexTwo: number;
    elementIndexTwo: number;
  };
}

const swapConfig: Swap = {
  firstArr: {
    arrIndexOne: 0,
    elementIndexOne: 0,
  },
  secondArr: {
    arrIndexTwo: 0,
    elementIndexTwo: 0,
  },
};

let isBeingDragged = false;

class Board {
  titleEl: HTMLHeadingElement;
  addBtn: HTMLDivElement;
  saveBtn: HTMLDivElement;
  addContainer: HTMLDivElement;
  textBox: HTMLDivElement;
  itemsListEl: HTMLUListElement;

  items: string[] = [];

  constructor(public title: string, public target: HTMLUListElement) {
    this.titleEl = target.querySelector('h1')!;
    this.addBtn = target.querySelector('.add-btn') as HTMLDivElement;
    this.saveBtn = target.querySelector('.add-btn.solid') as HTMLDivElement;
    this.addContainer = target.querySelector(
      '.add-container'
    ) as HTMLDivElement;
    this.textBox = target.querySelector('.add-item') as HTMLDivElement;
    this.itemsListEl = target.querySelector(
      '.drag-item-list'
    ) as HTMLUListElement;

    // assigning the title
    this.titleEl.textContent = title;
  }

  // displays the textbox upon clicking add item btn
  displayTextbox() {
    // show the textbox & add save item btn
    [this.saveBtn, this.addContainer].forEach(btn =>
      (btn as HTMLElement).classList.add('flex')
    );

    // hide the add item btn
    this.addBtn.classList.add('hidden');
  }

  // saves the item
  saveItem(item: string) {
    this.items.push(item);

    // update the dom
    [this.saveBtn, this.addContainer].forEach(btn =>
      (btn as HTMLElement).classList.remove('flex')
    );
    this.addBtn.classList.remove('hidden');
    this.textBox.textContent = '';

    saveBoards();

    console.log(this.items);
  }

  renderItems() {
    this.itemsListEl.innerHTML = '';

    this.items.forEach((item, i) =>
      this.itemsListEl.insertAdjacentHTML(
        'beforeend',
        `
        <li id="${i}" class="drag-item" draggable="true" ondragover="event.preventDefault()" contenteditable="true">
          ${item}
        </li>
        `
      )
    );
  }

  updateItem(indexOfItem: number, update: string) {
    if (isBeingDragged) return;

    if (!update.length) this.items.splice(indexOfItem, 1);
    else this.items[indexOfItem] = update;

    this.renderItems();
    saveBoards();
  }
}

// All boards
const boards = [
  new Board(
    'Backlog',
    document.querySelector('.backlog-column') as HTMLUListElement
  ),
  new Board(
    'In Progress',
    document.querySelector('.progress-column') as HTMLUListElement
  ),
  new Board(
    'Complete',
    document.querySelector('.complete-column') as HTMLUListElement
  ),
  new Board(
    'On Hold',
    document.querySelector('.on-hold-column') as HTMLUListElement
  ),
];

// functions
// returns the index of an element in an array
const indexOfEl = (el: HTMLElement, arr: any[]) => arr.indexOf(el);

// swaps two elements of any array or the same array
const swapElements = (config: Swap) => {
  const { arrIndexOne, elementIndexOne } = config.firstArr;
  const { arrIndexTwo, elementIndexTwo } = config.secondArr;
  const elementOne = boards[arrIndexOne].items[elementIndexOne];
  const elementTwo = boards[arrIndexTwo].items[elementIndexTwo];

  // if the drag and drop occured in the same board, then swap els
  if (arrIndexOne === arrIndexTwo) {
    boards[arrIndexOne].items[elementIndexOne] = elementTwo;
    boards[arrIndexTwo].items[elementIndexTwo] = elementOne;
  }

  // if the drag and drop occured in different board, them move el
  else console.log(elementOne, elementTwo);

  // save the boards
  saveBoards();

  // re-render the boards
  boards[arrIndexOne].renderItems();
  boards[arrIndexTwo].renderItems();
};

// saves the boards to localStorage
const saveBoards = () => {
  boards.forEach((board, i) =>
    localStorage.setItem(`board${i}`, JSON.stringify(board.items))
  );
};

// renders saved boards
const retriveBoards = () => {
  boards.forEach((board, i) => {
    // check if there's a saved board
    localStorage.getItem(`board${i}`)
      ? (board.items = JSON.parse(localStorage.getItem(`board${i}`)!))
      : null;

    // render the items of the board
    boards[i].renderItems();
  });
};

retriveBoards();

// event listeners
// Add item handler
elements.addBtns.forEach(btn =>
  btn.addEventListener('click', e => {
    const index = indexOfEl(
      (e.target as HTMLElement).closest('.add-btn') as HTMLDivElement,
      elements.addBtns
    );

    boards[index].displayTextbox();
  })
);

// save item handler
elements.saveItemBtns.forEach(btn =>
  btn.addEventListener('click', e => {
    const index = indexOfEl(
      (e.target as HTMLElement).closest('.solid') as HTMLDivElement,
      elements.saveItemBtns
    );

    const item = boards[index].textBox.textContent!;

    // save the typed in text
    if (item.length) {
      boards[index].saveItem(item);
      boards[index].renderItems();
    }
  })
);

// update an item
elements.listColumns.forEach(list =>
  list.addEventListener('focusout', e => {
    const target = e.target as HTMLUListElement;
    const index = indexOfEl(
      target.parentNode as HTMLElement,
      elements.listColumns
    );
    const { id, textContent: update } = target;

    boards[index].updateItem(+id, update?.trim()!);
  })
);

// drag handler
elements.listColumns.forEach(list =>
  list.addEventListener('dragstart', (e: DragEvent) => {
    const target = e.target as HTMLUListElement;

    // indexes of the first element
    swapConfig.firstArr.arrIndexOne = elements.listColumns.indexOf(
      target.parentNode as HTMLUListElement
    );
    swapConfig.firstArr.elementIndexOne = +target.id;

    isBeingDragged = false;
  })
);

// dragover handler

// drop handler
elements.listColumns.forEach(list =>
  list.addEventListener('drop', e => {
    const target = e.target as HTMLUListElement;

    // indexes of the second element
    swapConfig.secondArr.arrIndexTwo = elements.listColumns.indexOf(
      target.parentNode as HTMLUListElement
    );
    swapConfig.secondArr.elementIndexTwo = +target.id;

    isBeingDragged = true;
    swapElements(swapConfig);
  })
);
