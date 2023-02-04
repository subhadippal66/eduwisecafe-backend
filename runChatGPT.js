import * as mysql from 'mysql';
import showdown from 'showdown';
import fs from 'fs';
import moment from 'moment';
var converter = new showdown.Converter()


var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "eduwisecafedb"
});

async function getTopicsFromSQL(){
    let sqlQ = `SELECT * from topics WHERE isTextcreated IS NULL limit 20`
    con.query(sqlQ, async function (err, rows, fields) {
        if (err) throw err;
        try{
            await generateContent(rows);
        }
        catch(e){
            socketIo.emit('--ENABLE-BTN--', 'TRUE');
        }
    });
    return;
}

async function generateContent(messageList) {
    let sizeofDB = messageList.length;
    if(sizeofDB==0){
        socketIo.emit('--ENABLE-BTN--', 'TRUE')
    }

    let date = moment().format('MMMM Do YYYY');

    for (let i = 0; i < messageList.length; i++) {

        let template = `I want you to write a long article on the topic - "${messageList[i]["header"]}". Just return me an article nothing else.`

        console.log(template);

        socketIo.emit('trigger',template)

        const result = await api.sendMessage(template)

        if (result.response.includes("I don't understand your question")) {
            continue;
        }
        if (result.response.substring(0, 100).includes("I'm sorry")) {
            continue;
        }

        let text = result.response;

        let content = "TEST";
        content = converter.makeHtml(text);

        // socketIo.emit('trigger',content)
        
        let TXTfilePath = './text/' + messageList[i]["header"]
                                        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
                                        .replaceAll(" ","-") 
        + "-" + messageList[i]['id'] + ".txt";

        fs.writeFile(TXTfilePath, content, (err) => {
            if (err) throw err;
            else{
                socketIo.emit('trigger',TXTfilePath)

                let sqlQ = `UPDATE topics SET isTextcreated = 1, c1 = '${TXTfilePath}', dateCreated = '${date}', description = '${text.replace(/\n/g, " ").replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')}' WHERE id = '${messageList[i]['id']}'`
                con.query(sqlQ, function (err, rows, fields) {
                    if (err) throw err
                    else{
                        socketIo.emit('trigger',"DB Updated")
                        socketIo.emit('--countCHATGPT--', i)
                    }
                    if(i==sizeofDB-1){
                        socketIo.emit('--ENABLE-BTN--', 'TRUE')
                    }
                });
            }

        });

    }

}

export {getTopicsFromSQL}