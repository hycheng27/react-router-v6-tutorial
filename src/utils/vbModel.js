import { snakeToCamelCase } from './codeUtil';

export function getColumnDefinitions(tableDefColLines) {
  // For each line of tableDefColLines, get the column name, type, and if it's nullable.
  // Make switch cases to construct the output for each type.
  if (!Array.isArray(tableDefColLines) || !tableDefColLines.length) {
    return [];
  }

  // clear non-related lines
  tableDefColLines = tableDefColLines.filter((line) => {
    if (line.includes('CONSTRAINT') || line.includes(');')) {
      return false;
    }
    return true;
  });

  // do some data cleaning
  const lineObjs = tableDefColLines
    .map((line) => {
      // remove everything in parentheses
      line = line.replace(/\(.*\)/g, '');

      // remove other keywords
      const removeChars = ['IDENTITY', ','];
      removeChars.forEach((chars) => {
        line = line.replace(chars, '');
      });

      // replace multiple spaces with one space
      line = line.replace(/\s\s+/g, ' ');

      // remove leading and trailing spaces
      line = line.trim();

      // split the line into an array and return the lineObj
      const splittedLine = line.split(' ');
      const lineObj = {
        name: splittedLine[0].replace('[', '').replace(']', ''),
        type: splittedLine[1],
        isNullable: splittedLine[2] === 'NULL' ? true : false,
      };
      return lineObj;
    })
    .sort((a, b) => {
      // sort the lines by nullable or not
      if (a.isNullable && !b.isNullable) {
        return 1;
      } else if (!a.isNullable && b.isNullable) {
        return -1;
      } else {
        // then sort by is string or not
        if (!a.isNullable) {
          // don't sort if the line is not nullable
          return 0;
        }
        if (a.type.includes('VARCHAR') && !b.type.includes('VARCHAR')) {
          return 1;
        } else if (!a.type.includes('VARCHAR') && b.type.includes('VARCHAR')) {
          return -1;
        } else {
          return 0;
        }
      }
    });

  const columnDefs = [];
  for (let i = 0; i < lineObjs.length; i++) {
    let lineObj = lineObjs[i];

    let parsedStr = 'Public ' + snakeToCamelCase(lineObj.name);

    let parsedType = '';
    switch (lineObj.type) {
      // handle varchar types
      case 'VARCHAR':
      case 'NVARCHAR':
        parsedType = 'String';
        break;

      // handle int types
      case 'INT':
        parsedType = 'Integer';
        break;

      // handle smallint types
      case 'SMALLINT':
        parsedType = 'Short';
        break;

      // handle datetime types
      case 'DATETIME':
        parsedType = 'Date';
        break;

      // handle bit types
      case 'BIT':
        parsedType = 'Boolean';
        break;

      default:
        parsedType = 'UnknownType';
        break;
    }

    parsedStr += ` As ${parsedType}`;
    if (parsedStr.isNullable) {
      if (parsedType === 'String') {
        parsedStr += ' = Nothing';
      } else {
        parsedStr += '?';
      }
    }

    columnDefs.push({
      parsedStr: parsedStr,
      parsedName: snakeToCamelCase(lineObj.name),
      parsedType: parsedType,
      ...lineObj,
    });
  }
  return columnDefs;
}
