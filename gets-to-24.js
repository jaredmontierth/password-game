// ==UserScript==
// @name         Password Game Helper
// @namespace    http://tampermonkey.net/
// @version      0.0.4
// @description  gets to rule 24
// @author       Captain Proton
// @match        https://neal.fun/password-game/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function insertStarterPassword() {
        let divField = document.querySelector('div.ProseMirror > p > span');
        let starterPassword = "iamenough🏋️‍♂️🏋️‍♂️🏋️‍♂️4mayshellHeEsOsXXXV!1884";

        if (divField) {
            // Remove the "go" that the user typed
            divField.textContent = divField.textContent.replace(/go/gi, '');

            // Insert the starter password
            divField.textContent += starterPassword;

            let event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            divField.dispatchEvent(event);
        } else {
            console.error("divField element not found.");
        }
    }


    function insertChessMove() {
    return new Promise((resolve, reject) => {
        let imgSrc = document.querySelector('.chess-img').src;
        let puzzleNumber = parseInt(imgSrc.match(/puzzle(\d+)\.svg/)[1]);
        let colorToMove = document.querySelector('.move').textContent.trim().split(" ")[0];

        fetch('http://localhost:3000/chess')
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                let chessMove = data.find(datum => parseInt(datum['Image Number']) === puzzleNumber && datum.Color === colorToMove).Text;

                let divField = document.querySelector('div.ProseMirror > p > span');

                if (divField) {
                    divField.textContent += chessMove;

                    let event = new Event('input', {
                        bubbles: true,
                        cancelable: true,
                    });
                    divField.dispatchEvent(event);
                    resolve();
                } else {
                    console.error("divField element not found.");
                    reject(new Error("divField element not found."));
                }
            })
            .catch(err => {
                console.error(err);
                reject(err);
            });
    });
}


    // gets coords from google maps url
function extractCoordinates(url) {
    const pattern = /!1d(.*?)!2d(.*?)!/;

    const match = pattern.exec(url);

    if (match) {
        const latitude = parseFloat(match[1]);
        const longitude = parseFloat(match[2]);
        return { latitude, longitude };
    } else {
        console.log("No coordinates found in this URL.");
        return null;
    }
}

// get country name from coords
function getCountry({ latitude, longitude }) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        let divField = document.querySelector('div.ProseMirror');
        if (divField && divField.querySelector('p')) {
            let paragraphElement = divField.querySelector('p');

            paragraphElement.textContent += data.address.country.toLowerCase() + ' ';

            let event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            divField.dispatchEvent(event);
        } else {
            console.error("divField element or paragraph element not found.");
        }
    })
    .catch(error => console.error(error));
}

// get google maps url
const iframe = document.querySelector('iframe.geo');
if (iframe) {
    const url = iframe.getAttribute('src');
    const coordinates = extractCoordinates(url);

    // append country name to password text box
    if (coordinates) {
        getCountry(coordinates);
    }
}



    function insertMoonPhase() {
        fetch('http://localhost:3000/moonPhase')
            .then(response => response.json())
            .then(data => {
                let moonPhase = data.emoji;

                // textbox
                let divField = document.querySelector('div.ProseMirror');

                // check if exists
                if (divField && divField.querySelector('p')) {
                    let paragraphElement = divField.querySelector('p');
                    paragraphElement.textContent += moonPhase;

                    let event = new Event('input', {
                        bubbles: true,
                        cancelable: true,
                    });
                    divField.dispatchEvent(event);
                } else {
                    console.error("divField element or paragraph element not found.");
                }
            })
            .catch(console.error);
    }

    function insertWordleSolution() {
        fetch('http://localhost:3000/wordle')
            .then(response => response.json())
            .then(data => {
                let wordleSolution = data.solution;

                // textbox
                let divField = document.querySelector('div.ProseMirror');

                // check if exists
                if (divField && divField.querySelector('p')) {
                    let paragraphElement = divField.querySelector('p');
                    paragraphElement.textContent += wordleSolution;

                    let event = new Event('input', {
                        bubbles: true,
                        cancelable: true,
                    });
                    divField.dispatchEvent(event);
                } else {
                    console.error("divField element or paragraph element not found.");
                }
            })
            .catch(console.error);
    }


    // CAPTCHA script
function insertCaptcha(newSrc) {
    let filename = newSrc.split('/').pop();
    let newCode = filename.slice(0, 5);
    let captchaDigits = newCode.split('').filter(char => !isNaN(char)).map(Number);
    let captchaSum = captchaDigits.reduce((acc, digit) => acc + digit, 0);

    // If the sum isn't less than 5, delete the existing captcha after 1 second, then click the refresh button
    if (captchaSum >= 5) {
        console.log('Captcha not suitable. Will fetch a new CAPTCHA in 1 second...');
        setTimeout(() => {
            deleteCaptcha(newCode);
            let refreshButton = document.querySelector('img.captcha-refresh');
            if (refreshButton) {
                refreshButton.click();
            } else {
                console.error("Refresh button not found.");
            }
        }, 100);
        return;
    }

    let divField = document.querySelector('div.ProseMirror');
    if (divField && divField.querySelector('p')) {
        let paragraphElement = divField.querySelector('p');
        let oldText = paragraphElement.textContent;

        // Extracting the editable digits
        let starterString = "iamenough🏋️‍♂️🏋️‍♂️🏋️‍♂️4mayshellHeEsOsXXXV!";
        let position = oldText.indexOf(starterString);

        if (position !== -1) {
            let editableDigits = oldText.slice(position + starterString.length, position + starterString.length + 4).split('');

            for (let i = 0; i < editableDigits.length; i++) {
                let digit = parseInt(editableDigits[i], 10);
                if (digit - captchaSum >= 0) {
                    editableDigits[i] = (digit - captchaSum).toString();
                    if (editableDigits[i] === "0") {
                        editableDigits.splice(i, 1);
                    }
                    break;
                }
            }

            // Constructing the new content
            let newText = oldText.slice(0, position + starterString.length) + editableDigits.join('') + oldText.slice(position + starterString.length + 4);
            paragraphElement.textContent = newText + newCode;

            let event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            divField.dispatchEvent(event);
        } else {
            console.error("Starter string not found in the content.");
        }
    } else {
        console.error("divField element or paragraph element not found.");
    }
    console.log('New CAPTCHA inserted.');
}


function deleteCaptcha(captchaCode) {
    let divField = document.querySelector('div.ProseMirror');

    if (divField && divField.querySelector('p')) {
        let paragraphElement = divField.querySelector('p');
        let oldText = paragraphElement.textContent;

        // Locate the CAPTCHA code within the text
        let captchaPosition = oldText.lastIndexOf(captchaCode);

        if (captchaPosition !== -1) {
            // Remove the CAPTCHA code
            let newText = oldText.substring(0, captchaPosition) + oldText.substring(captchaPosition + captchaCode.length);
            paragraphElement.textContent = newText;

            let event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            divField.dispatchEvent(event);
        }
    } else {
        console.error("divField element or paragraph element not found.");
    }
    console.log('Old CAPTCHA removed.');
}


function processChessMove() {
    let divField = document.querySelector('div.ProseMirror > p > span');
    if (divField) {
        const content = divField.textContent;
        const lastSpaceIndex = content.lastIndexOf(" ");
        const chessMove = content.slice(lastSpaceIndex + 1);

        const numberPattern = /[1-8]/;
        const match = chessMove.match(numberPattern);

        if (match) {
            let chessNumber = parseInt(match[0], 10);
            console.log("Chess number:", chessNumber);

            let starterString = "iamenough🏋️‍♂️🏋️‍♂️🏋️‍♂️4mayshellHeEsOsXXXV!";
            let position = content.indexOf(starterString);

            if (position !== -1) {
                let editableDigits = content.slice(position + starterString.length, position + starterString.length + 4).split('');

                for (let i = 0; i < editableDigits.length; i++) {
                    let digit = parseInt(editableDigits[i], 10);
                    if (digit - chessNumber >= 0) {
                        editableDigits[i] = (digit - chessNumber).toString();
                        if (editableDigits[i] === "0") {
                            editableDigits.splice(i, 1);
                        }
                        break;
                    }
                }

                let newText = content.slice(0, position + starterString.length) + editableDigits.join('') + content.slice(position + starterString.length + 4);
                divField.textContent = newText;

                let event = new Event('input', {
                    bubbles: true,
                    cancelable: true,
                });
                divField.dispatchEvent(event);
            } else {
                console.error("Starter string not found in the content.");
            }
        } else {
            console.error("Valid number not found in the chess move.");
        }
    } else {
        console.error("divField element not found.");
    }
}

function replaceElements() {
    let divField = document.querySelector('div.ProseMirror > p > span');
    if (divField) {
        const content = divField.textContent;
        const lastSpaceIndex = content.lastIndexOf(" ");
        const chessMove = content.slice(lastSpaceIndex + 1);

        const replacements = {
            "N": "HeHeEsRhTi",
            "Re": "HeHeOsTi",
            "Ne": "HeHeEsGd",
            "K": "HeEsGaFe",
            "B": "HeHeEsTiAg",
            "Rg": "HeGd",
            "Bh": "HeGdBe",
            "Rh": "HeEsGa",
            "Rb": "HeGdBeYb",
            "Be": "HeGdBeYbAs",
            "Rf": "HeGdN",
            "Nd": "HeGdNRu",
            "Nh": "HeSm",
            "Nb": "HeGdYb"
        };

        function getReplacement(startOfMove) {
            if (replacements[startOfMove]) {
                return replacements[startOfMove];
            }
            // If the two-letter match didn't work, try single letter
            return replacements[startOfMove[0]] || 'HeEsOs';
        }

        let possibleStart = chessMove.slice(0, 2);
        let replacement = getReplacement(possibleStart);

        console.log("Detected chess move:", chessMove);
        console.log("Selected replacement:", replacement);

        const starterString = "iamenough🏋️‍♂️🏋️‍♂️🏋️‍♂️4mayshell";
        let position = content.indexOf(starterString + "HeEsOs");

        if (position !== -1) {
            let newText = content.replace(starterString + "HeEsOs", starterString + replacement);
            divField.textContent = newText;

            let event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            divField.dispatchEvent(event);
        } else {
            console.error("Starter string not found in the content.");
        }
    } else {
        console.error("divField element not found.");
    }
}


function startMonitoringPaulsFood() {
    setInterval(() => {
        let divField = document.querySelector('div.ProseMirror > p > span');
        if (divField) {
            let bugCount = (divField.textContent.match(/🐛/g) || []).length;
            if (bugCount <= 2) {
                let bugsNeeded = 8 - bugCount;
                for (let i = 0; i < bugsNeeded; i++) {
                    divField.textContent += "🐛";
                }

                let event = new Event('input', {
                    bubbles: true,
                    cancelable: true,
                });
                divField.dispatchEvent(event);
            }
        } else {
            console.error("divField element not found.");
        }
    }, 5000);  // check every 5 seconds
}



function boldVowels() {
    let divField = document.querySelector('div.ProseMirror > p > span');

    if (!divField) {
        console.error("divField element not found.");
        return;
    }

    const vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'A', 'E', 'I', 'O', 'U', 'Y'];
    let walker = document.createTreeWalker(divField, NodeFilter.SHOW_TEXT);

    let ranges = [];

    // Collect ranges of all vowels
    while (walker.nextNode()) {
        let node = walker.currentNode;
        for (let vowel of vowels) {
            let startIndex = 0;
            while (node.nodeValue && (startIndex = node.nodeValue.indexOf(vowel, startIndex)) !== -1) {
                let range = document.createRange();
                range.setStart(node, startIndex);
                range.setEnd(node, startIndex + 1);
                ranges.push(range);
                startIndex++;
            }
        }
    }

    // Wrap each vowel range in <strong>
    for (let range of ranges) {
        let wrapper = document.createElement('strong');
        range.surroundContents(wrapper);
    }
}


// Assuming the CAPTCHA changes when the refresh button is clicked, you might want to add an event listener
// to the CAPTCHA image element to handle when it loads a new CAPTCHA. This will repeatedly call
// `insertCaptcha` until a valid CAPTCHA is found.

let captchaImage = document.querySelector('img.captcha-image'); // Replace this with the correct selector for the CAPTCHA image
if (captchaImage) {
    captchaImage.addEventListener('load', function() {
        // Call insertCaptcha with the new CAPTCHA's source URL
        insertCaptcha(captchaImage.src);
    });
}


    console.log('Tampermonkey script started.');

    let checkInterval = setInterval(function() {
        let captchaImg = document.querySelector('img.captcha-img');
        if (captchaImg) {
            console.log('Captcha image found! Running script and setting up observer...');
            clearInterval(checkInterval);
            insertCaptcha(captchaImg.src);

            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'src') {
                        console.log('Captcha source has changed.');
                        deleteCaptcha();
                        insertCaptcha(mutation.target.src);
                    }
                });
            });

            observer.observe(captchaImg, {
                attributes: true,
            });
        } else if (document.querySelector('.chess-img')) {


        } else {

        }
    }, 1000);

    let wordleCheckInterval = setInterval(function() {
        let wordleDiv = document.querySelector('div[data-v-520e375b]');
        if (wordleDiv && wordleDiv.textContent.includes("Your password must include today's Wordle answer")) {
            console.log('Wordle requirement detected! Fetching solution and inserting...');
            insertWordleSolution();
            clearInterval(wordleCheckInterval);
        }
    }, 1000);

    let moonPhaseCheckInterval = setInterval(function() {
        let rule13Div = document.querySelector('div[data-v-520e375b]');
        if (rule13Div && rule13Div.textContent.includes("Your password must include the current phase of the moon as an emoji")) {
            console.log('Rule 13 detected! Fetching moon phase and inserting...');
            insertMoonPhase();
            clearInterval(moonPhaseCheckInterval);
        }
    }, 1000);

        let rule14CheckInterval = setInterval(function() {
        let rule14Div = document.querySelector('div[data-v-520e375b]');
        if (rule14Div && rule14Div.textContent.includes("Your password must include the name of this country")) {
            console.log('Rule 14 detected! Fetching country name and inserting...');
            clearInterval(rule14CheckInterval);
            const iframe = document.querySelector('iframe.geo');
            if (iframe) {
                const url = iframe.getAttribute('src');
                const coordinates = extractCoordinates(url);
                if (coordinates) {
                    getCountry(coordinates);
                }
            }
        }
    }, 1000);

let rule16CheckInterval = setInterval(() => {
    let rule16Div = document.querySelector('div[data-v-520e375b]');
    if (rule16Div && rule16Div.textContent.includes("Your password must include the best move in algebraic chess notation")) {
        console.log('Rule 16 detected! Fetching chess move and inserting...');
        clearInterval(rule16CheckInterval);

        insertChessMove()
            .then(() => {
                processChessMove();
            })
            .catch(err => {
                console.error("Error during inserting chess move:", err);
            });
    }
}, 1000);

let rule17CheckInterval = setInterval(() => {
    let rule17Div = document.querySelector('div[data-v-520e375b]');
    if (rule17Div && rule17Div.textContent.includes("🥚 ← This is my chicken Paul. He hasn't hatched yet, please put him in your password and keep him safe.")) {
        console.log('Rule 17 detected! Inserting Paul the chicken egg into password...');
        clearInterval(rule17CheckInterval);

        let divField = document.querySelector('div.ProseMirror > p > span');
        if (divField) {
            divField.textContent += '🥚';

            let event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            divField.dispatchEvent(event);
        } else {
            console.error("divField element not found.");
        }
    }
}, 1000);

let rule18CheckInterval = setInterval(() => {
    let rule18Div = document.querySelector('div[data-v-520e375b]');
    if (rule18Div && rule18Div.textContent.includes("The elements in your password must have atomic numbers that add up to 200.")) {
        console.log('Rule 18 detected! Replacing elements...');
        clearInterval(rule18CheckInterval);

        replaceElements();

        let divField = document.querySelector('div.ProseMirror > p > span');
        if (divField) {
            let event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            divField.dispatchEvent(event);
        } else {
            console.error("divField element not found.");
        }
    }
}, 1000);


let copiedPassword = "";

let rule19CheckInterval = setInterval(() => {
    let rule19Div = document.querySelector('div[data-v-520e375b]');
    if (rule19Div && rule19Div.textContent.includes("All the vowels in your password must be bolded.")) {
        console.log('Rule 19 detected! Making the vowels bold...');
        clearInterval(rule19CheckInterval);

        boldVowels();

        let divField = document.querySelector('div.ProseMirror > p > span');
        if (divField) {
            copiedPassword = divField.textContent;
            let event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            divField.dispatchEvent(event);
        } else {
            console.error("divField element not found.");
        }
    }
}, 1000);

let rule20CheckInterval = setInterval(() => {
    let rule20Div = document.querySelector('div[data-v-520e375b]');
    if (rule20Div && rule20Div.textContent.includes("Oh no! Your password is on fire. Quick, put it out!")) {
        console.log('Rule 20 detected! Extinguishing the fire...');
        clearInterval(rule20CheckInterval);

        let divField = document.querySelector('div.ProseMirror > p > span');
        if (divField) {

            divField.textContent = divField.textContent.replace(/[^🥚]/g, '');


            setTimeout(() => {
                divField.textContent = copiedPassword.replace('🥚', '') + divField.textContent;

                let event = new Event('input', {
                    bubbles: true,
                    cancelable: true,
                });
                divField.dispatchEvent(event);

                boldVowels();

            }, 1000);
        } else {
            console.error("divField element not found.");
        }
    }
}, 1000);

let rule23CheckInterval = setInterval(() => {
    let rule23Div = document.querySelector('div[data-v-520e375b]');
    if (rule23Div && rule23Div.textContent.includes("Paul has hatched! Please don't forget to feed him, he eats three 🐛 every minute.")) {
        console.log('Rule 23 detected! Starting to feed Paul...');

        let divField = document.querySelector('div.ProseMirror > p > span');
        if (divField) {
            divField.textContent += "🐛🐛🐛🐛🐛🐛🐛🐛";

            let event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            divField.dispatchEvent(event);
        } else {
            console.error("divField element not found.");
        }

        clearInterval(rule23CheckInterval);  // stop checking for rule 23
        startMonitoringPaulsFood();  // start feeding function
    }
}, 1000);




    let startInterval = setInterval(function() {
        let divField = document.querySelector('div.ProseMirror > p > span');
        if (divField && divField.textContent.toLowerCase().includes("go")) {
            console.log('Go command detected! Inserting starter password...');
            clearInterval(startInterval);

            insertStarterPassword();
            starterPasswordInserted = true;
        }

        if (starterPasswordInserted && !divField.textContent.toLowerCase().includes("go")) {
            console.log('Go command removed.');
            starterPasswordInserted = false;
        }
    }, 1000);
})();