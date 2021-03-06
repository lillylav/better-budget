const indexedDB = window.indexedDB;

// create variable to hold db connection
let db;

// establish a connection to IndexedDB database called 'better' and set it to version 1
const request = indexedDB.open('better', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    let db = event.target.result;
    // create an object store (table) called `better`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('pending', { autoIncrement: true });
};


// upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;

        // check if app is online, if yes run sendTransaction() function to send all local db data to api
        if (navigator.onLine) {
            uploadTransactions();
        }
    };

    request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// upon error
request.onerror = function(event) {
    console.log("Holy cow! " + event.target.errorCode);
};

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['pending'], 'readwrite');
  
    // access the object store for `pending`
    const transactionObjectStore = transaction.objectStore('pending');
  
    // add record to your store with add method
    transactionObjectStore.add(record);
};

function uploadTransactions() {
    // open a transaction on your db
    const transaction = db.transaction(['pending'], 'readwrite');

    // access your object store
    const transactionObjectStore = transaction.objectStore('pending');

    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        .then(serverResponse => {
        if (serverResponse.message) {
            throw new Error(serverResponse);
        }
        // open one more transaction
        const transaction = db.transaction(['pending'], 'readwrite');
        // access the pending object store
        const pizzaObjectStore = transaction.objectStore('pending');
        // clear all items in your store
        pizzaObjectStore.clear();

        alert('All saved transactions have been submitted!');
        })
        .catch(err => {
        console.log(err);
        });
        }
    };
};

// listen for app coming back online
window.addEventListener('online', uploadTransactions);