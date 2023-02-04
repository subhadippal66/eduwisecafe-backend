// let tags = [
//     ["Panchala Kingdom", "History"],
// ]

// ["Upanishads", "History"],
// ["Kingdom of Kosala", "History"],
// ["Kuru Kingdom", "History"],
// ["Brahmi script", "History"],
// ["Barhadratha dynasty", "History"],
// ["Early Neolithic culture", "History"],
// ["Indus Valley Civilisation", "History"],
// ["Early Vedic period", "History"],
// ["Middle and Late Vedic period", "History"],


import fs from 'fs'
import * as mysql from 'mysql';

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "eduwisecafedb"
});

let topicList;

async function buildTopicList(tags) {
    let promtMsgTemplate = 'suggest me some titles for article on the topic of ';

    let promtMsg = '';

    let allTopics = [];

    for (let j = 0; j < tags.length; j++) {
        promtMsg = '';
        // promtMsg = promtMsgTemplate + tags[j];
        promtMsg = `I want you to act as a fancy title generator. I will type keywords via comma and you will reply with fancy titles with numbering. my first keywords are "${tags[j][0]}"`

        socketIo.emit('trigger', promtMsg)

        console.log(promtMsg)

        let result = await api.sendMessage(promtMsg)

        var content1 = result.response;

        socketIo.emit('trigger', content1)

        content1 = content1.split(/\n/)
        topicList = [];
        content1.forEach(d => {
            if (d.length > 0) {
                let a = d.substring(0, 4).replace(/"/g, "")
                if (a.match(/\d+\. /)) {
                    topicList.push(d.replace(/\d+\. /, '').replace(/"/g, ""))
                }
            }
        })

        topicList.forEach(d => {
            if (d.length > 1) {
                // let lastChar = d.slice(-1);
                let lastChar = false;
                if (isNumeric(lastChar)) {
                    allTopics.push({
                        "Topic": d.slice(0, -1),
                        "Tags": tags[j][0],
                        "tagCategory": tags[j][1]
                    })
                } else {
                    allTopics.push({
                        "Topic": d,
                        "Tags": tags[j][0],
                        "tagCategory": tags[j][1]
                    })
                }
            }
        })


    }

    shuffle(allTopics);

    let qu = "INSERT INTO `eduwisecafedb`.`topics` (`header`,`topic`,`subtopic`) VALUES "

    let val = ''

    allTopics.forEach(d=>{
        val += `('${d['Topic'].replaceAll("'","''")}' , '${d['tagCategory'].replaceAll("'","''")}' , '${d['Tags'].replaceAll("'","''")}'),`
    })


    con.query(qu+val.slice(0,-1), async function (err, rows, fields) {
        if (err) throw err;
        try{
            
        }
        catch(e){
            socketIo.emit('--ENABLE-BTN--', 'TRUE');
        }
    });


    fs.writeFile("./allTopics.json", JSON.stringify(allTopics), err => {
        if (err) {
            console.error(err)
            return
        }
    });

    socketIo.emit('trigger', "DONE ✅")
    socketIo.emit('--ENABLE-BTN--', 'TRUE')


}

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

export {buildTopicList}