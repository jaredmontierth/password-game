const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
app.use(cors());

app.get('/moonPhase', async (req, res) => {
    try {
        const response = await axios.get("https://nineplanets.org/moon/phase/today/");
        const $ = cheerio.load(response.data);

        const moonPhaseText = $('p.is-size-5').find('strong').text();

        const moonPhaseToEmoji = {
            "New Moon": "🌑",
            "Waxing Crescent": "🌒",
            "First Quarter": "🌓",
            "Waxing Gibbous": "🌔",
            "Full Moon": "🌕",
            "Waning Gibbous": "🌖",
            "Last Quarter": "🌗",
            "Waning Crescent": "🌘",
        };

        const emoji = moonPhaseToEmoji[moonPhaseText] || "";

        res.json({ moonPhaseText, emoji });


        console.log(`${new Date().toLocaleString()} moon phase: ${moonPhaseText, emoji}`);
    } catch (error) {
        res.json({ error: error.toString() });
    }
});

app.get('/wordle', async (req, res) => {
    const date = new Date().toISOString().split('T')[0]; 
    const url = `https://www.nytimes.com/svc/wordle/v2/${date}.json`;
    
    try {
        const response = await axios.get(url);
        res.json(response.data);
        

        console.log(`${new Date().toLocaleString()} Wordle: ${response.data.solution}`);
    } catch (error) {
        res.json({ error: error.toString() });
    }
});

app.get('/chess', async (req, res) => {
    let results = [];
    fs.createReadStream('best-move.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results);
            console.log(`${new Date().toLocaleString()} Chess request`);
        });
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

