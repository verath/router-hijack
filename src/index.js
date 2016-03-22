function fingerprint(ip) {
    return new Promise((resolve, reject) => {
        const languageSrc = `http://${ip}/languages-en.js`;
        const frame = document.createElement('iframe');
        const languageScript = document.createElement('script');

        languageScript.src = languageSrc;
        languageScript.addEventListener('load', () => {
            if (frame.contentWindow['know_href'] === "http://kbserver.netgear.com/wndr3700.asp") {
                resolve();
            } else {
                reject();
            }
        });
        languageScript.addEventListener('error', reject);

        document.body.appendChild(frame);
        frame.contentWindow.document.body.appendChild(languageScript);
    });
}


(function main() {
    // Wait for document loaded
    window.addEventListener('load', () => {
        const fingerprintPromises = [
            "192.168.1.245",
            "192.168.1.246",
            "192.168.1.247",
            "192.168.1.248",
            "192.168.1.249",
            "192.168.1.250",
            "192.168.1.251",
            "192.168.1.252",
            "192.168.1.253"
        ].map((ip) => {
            fingerprint(ip).then(() => {
                console.log(ip, "ok!");
            }, () => {
                console.log(ip, "nok!");
            });
        });
    });

    // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
    const PRIVATE_NETWORKS = [
        "10.0.0.0-10.255.255.255",
        "172.16.0.0-172.31.255.255",
        "192.168.0.0-192.168.255.255"
    ];
})();



