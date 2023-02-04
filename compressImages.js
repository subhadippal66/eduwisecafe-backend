import * as mysql from 'mysql';
import fs from 'fs';
import Jimp from 'jimp'

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "eduwisecafedb"
});

function getDatafromSQLToCompressImage(){
    let sqlQ = `SELECT * from topics WHERE isTextcreated = 1 AND isImageCreated = 1 AND isImageCompressed IS NULL LIMIT 20`
    con.query(sqlQ, async function (err, rows, fields) {
        if (err) throw err;
        await compressImages(rows);
    });
    return;
}

async function compressImages(rows){
    let sizeofDB = rows.length;
    if(sizeofDB==0){
        socketIo.emit('--ENABLE-BTN--', 'TRUE')
    }
    
    for(let i=0; i<rows.length; i++){
        socketIo.emit('trigger',rows[i]['id']+"-"+rows[i]['header'])
        socketIo.emit('trigger',rows[i]['c2'])

        let imgName = rows[i]["header"]
                .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
                .replaceAll(" ","-") 
        + "-" + rows[i]['id'] +".jpg"

        Jimp.read(rows[i]['c2'])
            .then(async(lenna) => {
            return await lenna
                .resize(512, 512)
                .quality(50) // set JPEG quality
                .write("./images_COMPRESSED/"+imgName); // save
            })
            .then(async()=>{
                let sqlQ = `UPDATE topics SET isImageCompressed = 1,ImageName = '${imgName}' WHERE id = '${rows[i]['id']}'`
                con.query(sqlQ, function (err, rows, fields) {
                    if (err) throw err
                    else{
                        socketIo.emit('trigger',"DB Updated")
                    }
                });
                setTimeout(() => {
                    let dest1 = 'E:/Development/eduwisecafe/prod/images/'
                    let dest2 = 'E:/Development/eduwisecafe/images/'
                    fs.copyFile("./images_COMPRESSED/"+imgName, dest1+imgName, (err) => {
                        if (err) {
                        console.log("Error Found:", err);
                        }
                    })
                    fs.copyFile("./images_COMPRESSED/"+imgName, dest2+imgName, (err) => {
                        if (err) {
                        console.log("Error Found:", err);
                        }
                    })

                    socketIo.emit('--countCHATGPT--', i)
                    if(i==sizeofDB-1){
                        socketIo.emit('--ENABLE-BTN--', 'TRUE')
                    }

                }, 3000);
            })
            
    }
}

export {getDatafromSQLToCompressImage}