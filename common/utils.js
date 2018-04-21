// Convert to a string containing monospace digits (zero pads left if < 10)
export function monoDigits(num, pad = true) {
  if (pad && num < 10) {
    return c0 + monoDigit(num);
  } else {
    let monoNum = ''
    while (num > 0) {
      monoNum = monoDigit(num % 10) + monoNum
      num = (num / 10) | 0
    }
    return monoNum
  }
}

const c0 = String.fromCharCode(0x10);
const c1 = String.fromCharCode(0x11);
const c2 = String.fromCharCode(0x12);
const c3 = String.fromCharCode(0x13);
const c4 = String.fromCharCode(0x14);
const c5 = String.fromCharCode(0x15);
const c6 = String.fromCharCode(0x16);
const c7 = String.fromCharCode(0x17);
const c8 = String.fromCharCode(0x18);
const c9 = String.fromCharCode(0x19);

function monoDigit(num) {
  switch (num) {
    case 0: return c0;
    case 1: return c1;
    case 2: return c2;
    case 3: return c3;
    case 4: return c4;
    case 5: return c5;
    case 6: return c6;
    case 7: return c7;
    case 8: return c8;
    case 9: return c9;
  }
}
