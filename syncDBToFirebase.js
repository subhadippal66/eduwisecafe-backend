import { getFirestore, writeBatch, doc } from "firebase/firestore";

import * as mysql from 'mysql';

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "eduwisecafedb"
});
function getDataForFirebaseDB() {
    let sqlQ = `SELECT * from topics WHERE isTextcreated = 1 AND isImageCreated = 1 AND isImageCompressed = 1 AND isHTMLcreated = 1 AND s1 IS NULL`
    con.query(sqlQ, async function (err, rows, fields) {
        if (err) throw err;

        await syncDB(rows);
    });
    return;

}

async function syncDB(rows){

    if(rows.length == 0){
        socketIo.emit('trigger', "Up To Date")
        socketIo.emit('--ENABLE-BTN--', 'TRUE')
        return;
    }

    let batch = writeBatch(db);

    let sqlID = '('

    for(let i=0; i<rows.length; i++){

        sqlID += (rows[i]['id']+',')

        batch.set(doc(db, "master", rows[i]['id'].toString()), {
            fileName: rows[i]['HTMLname'],
            blogHeader: rows[i]['header'],
            blogBody: rows[i]['description'].substring(0,110)+'....',
            dateCreated: rows[i]['dateCreated'],
            tag1: rows[i]['subtopic'],
            tag2: rows[i]['topic'],
            tag3: "",
            analytics1: rows[i]['id'],
            analytics2: 0,
            analytics3: 0,
            isDeleted: false,
            imagePath: rows[i]['ImageName']
        });

    }
    sqlID = sqlID.slice(0, -1)
    sqlID += ')'

    await batch.commit();

    let sqlQ = `UPDATE topics SET s1 = 1 WHERE id IN ${sqlID}`;
    con.query(sqlQ, function (err, rows, fields) {
        if (err) throw err
        else{
            socketIo.emit('trigger',"DB Updated")
        }
    }); 

    socketIo.emit('trigger', sqlQ)
    socketIo.emit('--ENABLE-BTN--', 'TRUE')
    return;
}

export {getDataForFirebaseDB};