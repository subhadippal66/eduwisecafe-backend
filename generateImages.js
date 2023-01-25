import * as mysql from 'mysql';
import fs from 'fs';

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "eduwisecafedb"
});

function getDatafromSQLToGenerateImage(){
    let sqlQ = `SELECT * from topics WHERE isTextcreated = 1 AND isImageCreated IS NULL LIMIT 20`
    con.query(sqlQ, async function (err, rows, fields) {
        if (err) throw err;
        await generateImages_STABLE_DIFFUSION(rows);
    });
    return;
}

async function generateImages_STABLE_DIFFUSION(rows){
    let sizeofDB = rows.length;
    if(sizeofDB==0){
        socketIo.emit('--ENABLE-BTN--', 'TRUE')
    }

    for (let i = 0; i < rows.length; i++) {
        socketIo.emit('trigger',rows[i]['id']+"-"+rows[i]['header'])
        
        let promtMessage = rows[i]['header'] + ' , detailed, atmospheric, epic, concept art, matte painting, mist, photo-realistic, concept art, volumetric light';

        socketIo.emit('trigger', promtMessage);

        await fetch("http://127.0.0.1:7860/api/predict/", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,hi;q=0.8",
                "content-type": "application/json",
                "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "cookie": "_ga=GA1.1.1089318157.1672816967; _ga_Z0KEJCX008=GS1.1.1672835288.3.1.1672837364.0.0.0",
                "Referer": "http://127.0.0.1:7860/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
                "body": "{\"fn_index\":13,\"data\":[\""+promtMessage+"\",\"\",\"None\",\"None\",20,\"Euler a\",false,false,1,1,7,-1,-1,0,0,0,false,768,768,false,false,0.7,\"None\",false,false,null,\"\",\"Seed\",\"\",\"Nothing\",\"\",true,false,false,null,\"{\\\"prompt\\\": \\\""+promtMessage+"\\\", \\\"all_prompts\\\": [\\\""+promtMessage+"\\\", \\\""+promtMessage+"\\\", \\\""+promtMessage+"\\\", \\\""+promtMessage+"\\\"], \\\"negative_prompt\\\": \\\"\\\", \\\"seed\\\": 4236730966, \\\"all_seeds\\\": [4236730966, 4236730967, 4236730968, 4236730969], \\\"subseed\\\": 3762366053, \\\"all_subseeds\\\": [3762366053, 3762366054, 3762366055, 3762366056], \\\"subseed_strength\\\": 0, \\\"width\\\": 512, \\\"height\\\": 512, \\\"sampler_index\\\": 0, \\\"sampler\\\": \\\"Euler a\\\", \\\"cfg_scale\\\": 7, \\\"steps\\\": 20, \\\"batch_size\\\": 1, \\\"restore_faces\\\": false, \\\"face_restoration_model\\\": null, \\\"sd_model_hash\\\": \\\"7460a6fa\\\", \\\"seed_resize_from_w\\\": 0, \\\"seed_resize_from_h\\\": 0, \\\"denoising_strength\\\": null, \\\"extra_generation_params\\\": {}, \\\"index_of_first_image\\\": 1, \\\"infotexts\\\": [\\\""+promtMessage+"\\\\nSteps: 20, Sampler: Euler a, CFG scale: 7, Seed: 4236730966, Size: 768x768, Model hash: 7460a6fa\\\", \\\""+promtMessage+"\\\\nSteps: 20, Sampler: Euler a, CFG scale: 7, Seed: 4236730966, Size: 768x768, Model hash: 7460a6fa\\\", \\\""+promtMessage+"\\\\nSteps: 20, Sampler: Euler a, CFG scale: 7, Seed: 4236730967, Size: 768x768, Model hash: 7460a6fa\\\", \\\""+promtMessage+"\\\\nSteps: 20, Sampler: Euler a, CFG scale: 7, Seed: 4236730968, Size: 768x768, Model hash: 7460a6fa\\\", \\\""+promtMessage+"\\\\nSteps: 20, Sampler: Euler a, CFG scale: 7, Seed: 4236730969, Size: 768x768, Model hash: 7460a6fa\\\"], \\\"styles\\\": [\\\"None\\\", \\\"None\\\"], \\\"job_timestamp\\\": \\\"20230106103924\\\", \\\"clip_skip\\\": 1}\",\"<p>"+promtMessage+"<br>\\nSteps: 20, Sampler: Euler a, CFG scale: 7, Seed: 4236730966, Size: 768x768, Model hash: 7460a6fa</p><div class='performance'><p class='time'>Time taken: <wbr>33.43s</p><p class='vram'>Torch active/reserved: 3515/4174 MiB, <wbr>Sys VRAM: 6588/8192 MiB (80.42%)</p></div>\"],\"session_hash\":\"damtv0s7u6m\"}",
                "method": "POST"
        }).then(res => res.json())
        .then(async(json) => {

            socketIo.emit('trigger', "RENDER TIME -"+json.duration)

            var base64Data = json.data[0][0].replace(/^data:image\/png;base64,/, "");
            let imgName = rows[i]["header"]
                        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
                        .replaceAll(" ","-") 
            + "-" + rows[i]['id'] +".jpg"

            // Save HQ image locally
            let imgLoc = "./images_HQ/"+imgName;
            
            fs.writeFile(imgLoc, base64Data, 'base64', function(err) {
                if(err){throw err}

                socketIo.emit('trigger', "SAVED IN -"+imgLoc);

                // UPDATE DB
                let sqlQ = `UPDATE topics SET isImageCreated = 1, c2 = '${imgLoc}' WHERE id = '${rows[i]['id']}'`
                con.query(sqlQ, function (err, rows, fields) {
                    if (err) {
                        socketIo.emit('trigger',"<mark>Something went wrong</mark>")
                        throw err
                    }
                    else{
                        socketIo.emit('trigger',"DB Updated")
                        socketIo.emit('--countCHATGPT--', i)
                        if(i==sizeofDB-1){
                            console.log('----here')
                            socketIo.emit('--ENABLE-BTN--', 'TRUE')
                        }
                    }
                });
            });
        })

    }
}

export {getDatafromSQLToGenerateImage};