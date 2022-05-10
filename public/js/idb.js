// create variable to hold db connection
let db;


// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `better_budget`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('better_budget', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;

    // check if app is online, if yes run sendTransaction() function to send all local db data to api
    if (navigator.onLine) {
        saveRecord();
    }
    };

    request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_transaction'], 'readwrite');
  
    // access the object store for `new_transaction`
    const pizzaObjectStore = transaction.objectStore('new_transaction');
  
    // add record to your store with add method
    pizzaObjectStore.add(record);
};

