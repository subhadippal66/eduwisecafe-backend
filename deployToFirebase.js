import { exec } from "child_process";

function deployToFirebase(){
    exec("cd ../eduwisecafe && cd && firebase deploy", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);

        socketIo.emit('trigger', (stdout))

        socketIo.emit('--ENABLE-BTN--', 'TRUE')
    });
}

export {deployToFirebase};