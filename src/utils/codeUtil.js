// turns string to camelCase
export function snakeToCamelCase(str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

// turns string to PascalCase
export function snakeToPascalCase(str) {
  return str.toLowerCase().replace(/(?:^|[^a-zA-Z0-9]+)(.)/g, (m, chr) => chr.toUpperCase());
}

// turns 0-9 to english words
export function numberToWord(num) {
  const numToWord = {
    0: 'zero',
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
  };
  return numToWord[num];
}
