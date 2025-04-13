// Selecting buttons and display elements from the DOM
const clearBtn = document.getElementById("clear");
const negateBtn = document.getElementById("negate");
const percentBtn = document.getElementById("percent");
const deleteBtn = document.getElementById("delete");
const equalsBtn = document.getElementById("equals");
const numberBtns = document.querySelectorAll("[data-number]");
const operatorBtns = document.querySelectorAll("[data-operator]");
const prevOperation = document.getElementById("prevOperation");
const currOperation = document.getElementById("currOperation");

let shouldResetScreen = false;

// Adjusts the font size of the current operation based on its length
function adjustFontSize(){
    currOperation.style.fontSize = 
    currOperation.textContent.length > 14
    ? `${Math.max(2, 2.5 - (currOperation.textContent.length - 14) * 0.15)}rem`
    : "2.5rem";
};

adjustFontSize();

// Adds commas to numbers for formatting (e.g. 1,000)
function formatNumbersWithCommas(str){
    str = str.replace(/,/g, "");
    let parts = str.split(/([\+\-x÷])/);
    
    for (let i = 0; i < parts.length; i++){
        let part = parts[i];

        if(/\d/.test(part)) {
            let numberParts = part.split(".");
            numberParts[0] = numberParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            parts[i] = numberParts.join(".");
        }
    }
 
    return parts.join("");
};

// Handle number button clicks
numberBtns.forEach((button) => {
    button.addEventListener("click", () => {

        let lastChar = currOperation.textContent.slice(-1);

        // Handles when the first digit is a decimal point
        if((currOperation.textContent === "0" || shouldResetScreen) && button.textContent === "."){
            currOperation.textContent = "0.";
            shouldResetScreen = false;
            prevOperation.textContent = "";
            return;
        } else if(["+", "x", "-", "÷"].includes(lastChar) && button.textContent === "."){
            currOperation.textContent += "0";
        }

        // Prevents multiple decimals in a single number
        let lastNum = currOperation.textContent.split(/[x÷\-\+]/).pop();
        if (button.textContent === "." && lastNum.includes(".")) return;

        if (shouldResetScreen || currOperation.textContent === "0") {
            currOperation.textContent = button.textContent;
            prevOperation.textContent = "";
            shouldResetScreen = false;
        } else {
            currOperation.textContent += button.textContent;
        }

        // Format number with commas and adjust font size
        currOperation.textContent = formatNumbersWithCommas(currOperation.textContent);
        adjustFontSize();
    });
});

// Handle operator button clicks
operatorBtns.forEach((button) =>
    button.addEventListener("click", () => {
        const operators = ["+", "-", "x", "÷"];
        const lastChar = currOperation.textContent.slice(-1);
        const secondLastChar = currOperation.textContent.slice(-2, -1);

        // Allow negative numbers at the start
        if (button.textContent === "-" && currOperation.textContent === "0") {
            currOperation.textContent = shouldResetScreen ? currOperation.textContent + "-" : "-";
            shouldResetScreen = false;
            return;
        }

        // Reset screen if required
        if (shouldResetScreen) {
            prevOperation.textContent = "";
            shouldResetScreen = false;
        }

        // Handles compound operators like x- or ÷-
        if (lastChar === "-" && (secondLastChar === "÷" || secondLastChar === "x")) {
            currOperation.textContent = currOperation.textContent.slice(0, -2) + button.textContent;
        } else if (operators.includes(lastChar)) {
            if (button.textContent === "-" && (lastChar === "x" || lastChar === "÷")) {
                currOperation.textContent += button.textContent;
            } else {
                currOperation.textContent = currOperation.textContent.slice(0, -1) + button.textContent;
            }
        } else {
            currOperation.textContent += button.textContent;
        }
    })
);

// Handles evaluation when equal button is clicked
equalsBtn.addEventListener("click", () => {
    let cleanedexpr = currOperation.textContent.replace(/x/g, "*").replace(/÷/g, "/").replace(/,/g, "");

    // Remove trailing operator if any
    if(/[\+\-\*\/]$/.test(cleanedexpr)){
        cleanedexpr = cleanedexpr.slice(0, -1);
    }

    // Return if there’s nothing to evaluate or input is a single negative number
    if(!/[\+\-\*\/]/.test(cleanedexpr) || /^-\d+(\.\d+)?$/.test(cleanedexpr)) return;

    try {
        prevOperation.textContent = currOperation.textContent;
        let result = formatNumbersWithCommas(eval(cleanedexpr).toString());
        currOperation.textContent = result;
        shouldResetScreen = true;
    } catch (error) {
        currOperation.textContent = "Error";
        shouldResetScreen = true;
        return;
    }
});

// Clears the entire screen
clearBtn.addEventListener("click", () => {
    currOperation.textContent = "0";
    prevOperation.textContent = "";
    shouldResetScreen = false;
    adjustFontSize();
});

// Deletes the last digit/character
deleteBtn.addEventListener("click", () => {
    currOperation.textContent = formatNumbersWithCommas(currOperation.textContent.slice(0, -1)) || "0";

    if (currOperation.textContent === "0") {
        prevOperation.textContent = "";
    }
    adjustFontSize();
});

// Negates the last number entered (positive <-> negative)
negateBtn.addEventListener("click", () => {
    const match = currOperation.textContent.match(/(-?\d[\d,]*\.?\d*)$/);

    if(!shouldResetScreen && currOperation.textContent === "0"){
        return;
    }

    const toggled = match[0].startsWith("-") ? match[0].slice(1) : `-${match[0]}`;
    currOperation.textContent = currOperation.textContent.replace(match[0], formatNumbersWithCommas(toggled));
});

// Converts the last number entered into a percentage
percentBtn.addEventListener("click", () => {
    const match = currOperation.textContent.match(/(-?\d[\d,]*\.?\d*)$/);
    const percent = (parseFloat(match[0].replace(/,/g, "")) / 100).toString();
    currOperation.textContent = currOperation.textContent.replace(match[0], formatNumbersWithCommas(percent));
    shouldResetScreen = true;
});
