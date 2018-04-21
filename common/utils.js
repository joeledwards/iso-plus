// Convert to a string containing monospace digits
export function monoDigits(num) {
  if (num < 10) {
    return String.fromCharCode(0x10) + monoDigit(num);
  } else {
    let monoNum = ''
    while (num > 0) {
      monoNum = monoDigit(num % 10) + monoNum
      num = (num / 10) | 0
    }
    return monoNum
  }
}

function monoDigit(num) {
  switch (num) {
    case 0: return String.fromCharCode(0x10);
    case 1: return String.fromCharCode(0x11);
    case 2: return String.fromCharCode(0x12);
    case 3: return String.fromCharCode(0x13);
    case 4: return String.fromCharCode(0x14);
    case 5: return String.fromCharCode(0x15);
    case 6: return String.fromCharCode(0x16);
    case 7: return String.fromCharCode(0x17);
    case 8: return String.fromCharCode(0x18);
    case 9: return String.fromCharCode(0x19);
  }
}