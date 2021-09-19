let db;


// new db request created for "BudgetDB" database.
const request = indexedDB.open("budgetdb", 1);

request.onupgradeneeded = function (event) {

    const db = event.target.result;
    if (db.objectStoreNames.length === 0) {
        db.createObjectStore('transactions', { autoIncrement: true });
        console.log('Object Store created!')
    }

};

request.onsuccess = function (event) {
    db = event.target.result;


    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(`Request error: ${event.target.errorCode}`);
    // error to log here
};

function saveRecord(record) {
    const transaction = db.transaction(["transactions"], "readwrite");
    const objectStore = transaction.objectStore('transactions');
    objectStore.add(record);
    console.log(record);

}

function checkDatabase() {

    const transaction = db.transaction(["transactions"], "readwrite");
    const objectStore = transaction.objectStore("transactions")
    const getAll = objectStore.getAll();

    getAll.onsuccess = function () {
        console.log(getAll.result)
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction(["transactions"], "readwrite");
                    const objectStore = transaction.objectStore("transactions")
                    objectStore.clear();

                });
        }
    };
}

// listening for app to come back online
window.addEventListener('online', checkDatabase);