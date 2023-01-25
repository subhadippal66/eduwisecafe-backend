import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import * as mysql from 'mysql';

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "eduwisecafedb"
});

const firebaseConfig = {
  apiKey: "AIzaSyC7nxTGNVI5beKEX72kiKMvRszaQpsN6xQ",
  authDomain: "medium-plus.firebaseapp.com",
  projectId: "medium-plus",
  storageBucket: "medium-plus.appspot.com",
  messagingSenderId: "171729510224",
  appId: "1:171729510224:web:ffdd5d124b700b7dba9655",
  measurementId: "G-Z0KEJCX008"
};

const app = initializeApp(firebaseConfig);

import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const db = getFirestore(app);
const blogRef = collection(db, "AllTags");
const q = query(blogRef);

const querySnapshot = await getDocs(q);

let str = '';
querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${JSON.stringify( doc.data())}`);
    
    let sqlQ = `UPDATE topics SET topic = '${doc.data().tagCategory}' WHERE subtopic = '${doc.data().tagName}';`
    con.query(sqlQ, function (err, rows, fields) {
        if (err) throw err;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
        };
    });

});
