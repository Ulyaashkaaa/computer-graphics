const rInputRange = document.getElementById('r');
const gInputRange = document.getElementById('g');
const bInputRange = document.getElementById('b');
const rInputNumber = document.getElementById('rInput');
const gInputNumber = document.getElementById('gInput');
const bInputNumber = document.getElementById('bInput');

const cInputRange = document.getElementById('c');
const mInputRange = document.getElementById('m');
const yInputRange = document.getElementById('y');
const kInputRange = document.getElementById('k');
const cInputNumber = document.getElementById('cInput');
const mInputNumber = document.getElementById('mInput');
const yInputNumber = document.getElementById('yInput');
const kInputNumber = document.getElementById('kInput');

const hInputRange = document.getElementById('h');
const sInputRange = document.getElementById('s');
const vInputRange = document.getElementById('v');
const hInputNumber = document.getElementById('hInput');
const sInputNumber = document.getElementById('sInput');
const vInputNumber = document.getElementById('vInput');

const colorPreview = document.getElementById('colorPreview');
const colorPicker = document.getElementById('colorPicker');

function syncInputs(rangeElement, numberElement, updateFunction) {
    rangeElement.addEventListener('input', () => {
        numberElement.value = rangeElement.value;
        updateFunction(); 
    });

    numberElement.addEventListener('input', () => {
        rangeElement.value = numberElement.value;
        updateFunction(); 
    });
}

// RGB -> CMYK
function rgbToCmyk(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);

    if (k === 1) {
        return [0, 0, 0, 100];
    }

    c = ((c - k) / (1 - k)) * 100;
    m = ((m - k) / (1 - k)) * 100;
    y = ((y - k) / (1 - k)) * 100;
    k = k * 100;

    return [c, m, y, k];
}

// CMYK -> RGB
function cmykToRgb(c, m, y, k) {
    let r = 255 * (1 - c / 100) * (1 - k / 100);
    let g = 255 * (1 - m / 100) * (1 - k / 100);
    let b = 255 * (1 - y / 100) * (1 - k / 100);

    return [Math.round(r), Math.round(g), Math.round(b)];
}

// RGB -> HSV
function rgbToHsv(r, g, b) {
    let rNorm = r / 255;
    let gNorm = g / 255;
    let bNorm = b / 255;

    let max = Math.max(rNorm, gNorm, bNorm);
    let min = Math.min(rNorm, gNorm, bNorm);
    let delta = max - min;

    let h = 0;
    if (delta !== 0) {
        if (max === rNorm) {
            h = 60 * (((gNorm - bNorm) / delta) % 6);
        } else if (max === gNorm) {
            h = 60 * ((bNorm - rNorm) / delta + 2);
        } else {
            h = 60 * ((rNorm - gNorm) / delta + 4);
        }
    }

    let s = max === 0 ? 0 : delta / max;
    let v = max;

    return [Math.round(h), Math.round(s * 100), Math.round(v * 100)];
}

// HSV -> RGB
function hsvToRgb(h, s, v) {
    s /= 100;
    v /= 100;

    let c = v * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = v - c;

    let rPrime, gPrime, bPrime;
    if (h >= 0 && h < 60) {
        rPrime = c;
        gPrime = x;
        bPrime = 0;
    } else if (h >= 60 && h < 120) {
        rPrime = x;
        gPrime = c;
        bPrime = 0;
    } else if (h >= 120 && h < 180) {
        rPrime = 0;
        gPrime = c;
        bPrime = x;
    } else if (h >= 180 && h < 240) {
        rPrime = 0;
        gPrime = x;
        bPrime = c;
    } else if (h >= 240 && h < 300) {
        rPrime = x;
        gPrime = 0;
        bPrime = c;
    } else {
        rPrime = c;
        gPrime = 0;
        bPrime = x;
    }

    let r = Math.round((rPrime + m) * 255);
    let g = Math.round((gPrime + m) * 255);
    let b = Math.round((bPrime + m) * 255);

    return [r, g, b];
}

function updateFromCmyk() {
    const c = parseFloat(cInputRange.value);
    const m = parseFloat(mInputRange.value);
    const y = parseFloat(yInputRange.value);
    const k = parseFloat(kInputRange.value);

    const [r, g, b] = cmykToRgb(c, m, y, k);

    rInputRange.value = r;
    gInputRange.value = g;
    bInputRange.value = b;

    rInputNumber.value = r;
    gInputNumber.value = g;
    bInputNumber.value = b;

    updateColor(); 
}

function updateFromHsv() {
    const h = parseFloat(hInputRange.value);
    const s = parseFloat(sInputRange.value);
    const v = parseFloat(vInputRange.value);

    const [r, g, b] = hsvToRgb(h, s, v);

    rInputRange.value = r;
    gInputRange.value = g;
    bInputRange.value = b;

    rInputNumber.value = r;
    gInputNumber.value = g;
    bInputNumber.value = b;

    updateColor(); 
}

function updateColor() {
    const r = parseInt(rInputRange.value);
    const g = parseInt(gInputRange.value);
    const b = parseInt(bInputRange.value);

    const [c, m, y, k] = rgbToCmyk(r, g, b);
    const [h, s, v] = rgbToHsv(r, g, b);

    cInputRange.value = c;
    mInputRange.value = m;
    yInputRange.value = y;
    kInputRange.value = k;

    cInputNumber.value = c;
    mInputNumber.value = m;
    yInputNumber.value = y;
    kInputNumber.value = k;

    hInputRange.value = h;
    sInputRange.value = s;
    vInputRange.value = v;

    hInputNumber.value = h;
    sInputNumber.value = s;
    vInputNumber.value = v;

    colorPreview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

    const hexColor = rgbToHex(r, g, b);
    colorPicker.value = hexColor;
}



colorPicker.addEventListener('input', (event) => {
    const hexColor = event.target.value;
    const [r, g, b] = hexToRgb(hexColor);

    rInputRange.value = r;
    gInputRange.value = g;
    bInputRange.value = b;

    rInputNumber.value = r;
    gInputNumber.value = g;
    bInputNumber.value = b;

    updateColor();
});


// RGB в HEX
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

syncInputs(cInputRange, cInputNumber, updateFromCmyk);
syncInputs(mInputRange, mInputNumber, updateFromCmyk);
syncInputs(yInputRange, yInputNumber, updateFromCmyk);
syncInputs(kInputRange, kInputNumber, updateFromCmyk);

syncInputs(hInputRange, hInputNumber, updateFromHsv);
syncInputs(sInputRange, sInputNumber, updateFromHsv);
syncInputs(vInputRange, vInputNumber, updateFromHsv);

syncInputs(rInputRange, rInputNumber, updateColor);
syncInputs(gInputRange, gInputNumber, updateColor);
syncInputs(bInputRange, bInputNumber, updateColor);

updateColor();
