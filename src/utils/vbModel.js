import { snakeToCamelCase, numberToWord } from './codeUtil';

function cleanAndGetColsInfo(tableDefColLines) {
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
  const colsInfo = tableDefColLines.map((line) => {
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

    // split the line into an array and return the colInfo
    const splittedLine = line.split(' ');
    const colInfo = {
      name: splittedLine[0].replace('[', '').replace(']', ''),
      type: splittedLine[1],
      isNullable: splittedLine[2] === 'NULL' ? true : false,
    };

    // replace with english word if the first char is a number
    if (colInfo.name[0] >= '0' && colInfo.name[0] <= '9') {
      colInfo.name = numberToWord(colInfo.name[0]) + '_' + colInfo.name.substring(1);
    }

    return colInfo;
  });

  return colsInfo;
}

export function getColumnDefinitions(tableDefColLines) {
  const colsInfo = cleanAndGetColsInfo(tableDefColLines).sort((a, b) => {
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
  for (let i = 0; i < colsInfo.length; i++) {
    let colInfo = colsInfo[i];

    let parsedName;
    const reservedWords = ['to', 'step', 'module'];
    if (reservedWords.includes(colInfo.name)) {
      // if the name is a reserved word, add brackets around it
      parsedName = '[' + snakeToCamelCase(colInfo.name) + ']';
    } else {
      // otherwise, just convert it to camel case
      parsedName = snakeToCamelCase(colInfo.name);
    }

    let parsedStr = 'Public ' + parsedName;

    let parsedType = '';
    switch (colInfo.type) {
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
      parsedStr,
      parsedName,
      parsedType,
      ...colInfo,
    });
  }
  return columnDefs;
}

// change the parsed column definitions for res-models
export function getResColumnDefinitions(colDefs) {
  return colDefs.map((colDef) => {
    const { parsedName, parsedType } = colDef;
    let parsedStr = '';
    if (parsedType === 'String') {
      parsedStr = `Public ${parsedName} As String = Nothing`;
    } else {
      parsedStr = `Public ${parsedName} As ${parsedType}?`;
    }

    return {
      ...colDef,
      parsedStr,
    };
  });
}

function getTab(size = 1) {
  let tab = '';
  for (let i = 0; i < size; i++) {
    tab += '\t';
  }
  return tab;
}

export function getResModelComment(modelName, tabSize = 1) {
  let tabs = getTab(tabSize);
  return [
    "''' <summary>",
    `''' Every field from <see cref="${modelName}"/> except all of them are optional.<br/>`,
    "''' Useful for receiving data from DB when not all fields are selected.",
    "''' </summary>",
  ].join('\n' + tabs);
}

export function getColEnumsComment(tabSize = 1) {
  let tabs = getTab(tabSize);
  return [
    "''' <summary>",
    "''' Abstracted column names with enums. The indexes are not important.",
    "''' </summary>",
  ].join('\n' + tabs);
}

export function getColEnumClassComment(modelName, tabSize = 1) {
  let tabs = getTab(tabSize);
  return [
    "''' <summary>",
    `''' A Helper class for getting string column names for <see cref="${modelName}"/>. See <see cref="${modelName}Column.GetName"/>.`,
    "''' </summary>",
  ].join('\n' + tabs);
}

export function getColEnumClassGetNameComment(modelName, tabSize = 1) {
  let tabs = getTab(tabSize);
  return [
    "''' <summary>",
    `''' Gets the string representation of the enum table name <see cref="Enum${modelName}Columns"/>.`,
    "''' </summary>",
  ].join('\n' + tabs);
}

export function getCommaSeparatedNamesComment(modelName, tabSize = 1) {
  let tabs = getTab(tabSize);
  return [
    "''' <summary>",
    `'''Receives an array of <see cref="Enum${modelName}Columns"/> and returns a comma separated string for SQL query columns selection.`,
    `''' <returns>a comma separated string, e.g. "id, tender_id, created_by"</returns>`,
    "''' </summary>",
  ].join('\n' + tabs);
}
