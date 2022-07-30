// Variabel Utama
const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF';

// Fungsi melihat item di storage
document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
})

// Fungsi status storage 
function isStorage() {
    if (typeof (Storage) === undefined) {
        alert('Browser tidak mendukung fitur aplikasi');
        return false;
    }
    return true;
}

// Fungsi loader
document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('inputForm');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (isForm()) {
            addBook();
            resetForm();
        }
    })

    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        searchBook();
    })

    if (isStorage()) {
        loadDataFromStorage();
    }
})

// Fungsi Menambah buku
function addBook() {
    const title = document.getElementById('judul').value;
    const author = document.getElementById('penulis').value;
    const date = document.getElementById('tahun').value;

    const ID = generateId();
    const bookObject = generateBookObject(ID, title, author, date, false);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Fungsi untuk mendapatkan id unik
function generateId() {
    return +new Date();
}

// Fungsi untuk membuat objek 
function generateBookObject(id, title, author, date, isComplete) {
    return {
        id,
        title,
        author,
        date,
        isComplete
    }
}

// Fungsi menampilkan data
document.addEventListener(RENDER_EVENT, function() {
    const uncompletedBookList = document.getElementById('uncompleted');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('completed');
    completedBookList.innerHTML = '';

    for (const book of books) {
        const bookElement = makeBook(book);
        if (!book.isComplete) {
            uncompletedBookList.append(bookElement);
        } else {
            completedBookList.append(bookElement);
        }
    }
})

// Fungsi membuat tampilan data
function makeBook(bookObject) {
    const title = document.createElement('h3');
    title.innerHTML = bookObject.title;

    const author = document.createElement('p');
    author.innerHTML = bookObject.author;

    const date = document.createElement('p');
    date.innerHTML = bookObject.date;

    const trashbutton = document.createElement('img');
    trashbutton.src = 'assets/trash-bin.png';

    const imgContainer = document.createElement('div');
    imgContainer.className = 'box-footer';

    const checkbutton = document.createElement('img');

    const container = document.createElement('div');
    container.classList.add('box', 'thinborder', 'smallpadding');

    if (bookObject.isComplete) {
        checkbutton.src = 'assets/cross.png';

        checkbutton.addEventListener('click', function() {
            removeBookFromCompleted(bookObject.id);
        })
    } else {
        checkbutton.src = 'assets/checklist.png';

        checkbutton.addEventListener('click', function() {
            addBookToCompleted(bookObject.id);
        })
    }

    trashbutton.addEventListener('click', function () {
        removeBookFromList(bookObject.id);
    })
    
    imgContainer.append(checkbutton, trashbutton);

    container.append(title, author, date, imgContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    return container;
}

// Fungsi mencari data
function findBook(bookId) {
    for (const bookitem of books) {
        if (bookitem.id === bookId) {
            return bookitem;
        }
    }

    return -1;
}

// Fungsi mencari index data
function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

// Fungsi mencari data berdasarkan judul
function findBookByName(bookname) {
    const booksSearch = [];
    for (const bookitem of books) {
        if (bookitem.title.indexOf(bookname) != -1) {
            booksSearch.push(bookitem);
        }
    }
    return booksSearch;
}

// Fungsi menghapus data
function removeBookFromList(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    if (confirm("Yakin ingin menghapus ?")) {
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    } else {
        return;
    }   
}

// Fungsi memindah data ke rak selesai dibaca
function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget === -1) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Fungsi memindah data ke rak belum selesai dibaca
function removeBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget === -1) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Fungsi menambah data ke storage
function saveData() {
    if (isStorage()) {
        const parsedData = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsedData);
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

// Fungsi load data dari storage
function loadDataFromStorage() {
    let data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (data != null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

// Fungsi mereset form
function resetForm() {
    document.getElementById('judul').value = "";
    document.getElementById('penulis').value = "";
    document.getElementById('tahun').value = "";
}

// Fungsi validasi form
function isForm() {
    let falseInput = 0;

    const title = document.getElementById('judul');
    const author = document.getElementById('penulis');
    const date = document.getElementById('tahun');

    const validasi = document.getElementById('validasi');

    if (title.value.trim().length === 0) {
        falseInput++;
    }
    if (author.value.trim().length === 0) {
        falseInput++;
    }  
    if (date.value.trim().length === 0) {
        falseInput++;
    } 

    if (falseInput > 0) {
        validasi.classList.remove("none");
        return false;
    } else {
        validasi.classList.add("none");
        return true;
    }
}

// Fungsi pencarian
function searchBook() {
    const searchValue = document.getElementById('cari').value;

    if (searchValue.trim().length === 0) {
        document.dispatchEvent(new Event(RENDER_EVENT));
    } else {
        const booksTarget = findBookByName(searchValue);

        const uncompletedBookList = document.getElementById('uncompleted');
        uncompletedBookList.innerHTML = '';
    
        const completedBookList = document.getElementById('completed');
        completedBookList.innerHTML = '';
    
        for (const book of booksTarget) {
            const bookElement = makeBook(book);
            if (!book.isComplete) {
                uncompletedBookList.append(bookElement);
            } else {
                completedBookList.append(bookElement);
            }
        }
    }
}
