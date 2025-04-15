const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const TIMEOUT_MS = 500;

const validIDs = ['p', 'f', 'e', 'r'];

let window = [];

const thirdPartyURLs = {
    p: 'http://20.244.56.144/evaluation-service/primes',
    f: 'http://20.244.56.144/evaluation-service/fibo',
    e: 'http://20.244.56.144/evaluation-service/even',
    r: 'http://20.244.56.144/evaluation-service/rand'
};

app.get('/', (req, res) => {
    res.send('Server is running. Use /numbers/:numberid (p/f/e/r) to fetch numbers.');
});

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;

   
    if (!validIDs.includes(numberid)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const windowPrevState = [...window];
    let newNumbers = [];

    try {
        const response = await axios.get(thirdPartyURLs[numberid], {
            headers: {
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ0NzAyMDU3LCJpYXQiOjE3NDQ3MDE3NTcsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjY2MTlmOTZiLWRkMDgtNGEyNS1iMDc3LTU0MDVhZDViOGUxNCIsInN1YiI6InNob2liMjMzNy5iZTIyQGNoaXRrYXJhLmVkdS5pbiJ9LCJlbWFpbCI6InNob2liMjMzNy5iZTIyQGNoaXRrYXJhLmVkdS5pbiIsIm5hbWUiOiJzaG9pYiBraGFuIiwicm9sbE5vIjoiMjIxMDk5MjMzNyIsImFjY2Vzc0NvZGUiOiJQd3p1ZkciLCJjbGllbnRJRCI6IjY2MTlmOTZiLWRkMDgtNGEyNS1iMDc3LTU0MDVhZDViOGUxNCIsImNsaWVudFNlY3JldCI6IkJuek51dWpKd3RBc3RkTlIifQ.XHW57I2_SYJZm7CISFdjB-kAGsTEbptN77fZdvgI6aE`,
            },
            timeout: TIMEOUT_MS
        });


        if (response.status !== 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = response.data;
        newNumbers = data.numbers || [];

        newNumbers.forEach(num => {
            if (!window.includes(num)) {
                if (window.length >= WINDOW_SIZE) {
                    window.shift();
                }
                window.push(num);
            }
        });

        const avg = (window.reduce((a, b) => a + b, 0) / window.length).toFixed(2);

        res.json({
            windowPrevState,
            windowCurrState: window,
            numbers: newNumbers,
            avg: parseFloat(avg)
        });

    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Failed to fetch numbers or request timed out' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
