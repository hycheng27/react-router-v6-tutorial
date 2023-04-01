const testCase = [
  '[id] INT NOT NULL',
  '[field0] VARCHAR(50) NULL',
  '[field1] SMALLINT NULL',
  '[field2] NVARCHAR(MAX) NULL',
  '[field3] BIT NULL',
  '[field3] DATE NULL',
];

export function getColumnDefinitions(tableDefColLines) {
  // For each line of tableDefColLines, get the column name, type, and if it's nullable.
  // Make switch cases to construct the output for each type.
  const columnDefs = [];

  if (!Array.isArray(tableDefColLines) || !tableDefColLines.length) {
    console.warn('Using test case as the input');
    tableDefColLines = testCase;
  }

  for (let i = 0; i < tableDefColLines.length; i++) {
    let line = tableDefColLines[i];

    if (line.includes('CONSTRAINT') || line.includes(');')) {
      continue;
    }

    // remove leading and trailing spaces
    line = line.trim();

    // replace multiple spaces with one space
    line = line.replace(/\s\s+/g, ' ');

    // remove everything in parentheses
    line = line.replace(/\(.*\)/g, '');

    // remove other keywords
    const removeKeywords = ['IDENTITY'];
    for (let keyword in removeKeywords) {
      line = line.replace(keyword, '');
    }

    const splittedLine = line.split(' ');
    console.log('splittedLine', splittedLine);
    const name = splittedLine[0].replace('[', '').replace(']', '');
    const type = splittedLine[1];
    const isNullable = splittedLine[2] === 'NULL' ? true : false;
    console.log(name, type, isNullable);

    let colDef = 'Public ' + snakeToCamelCase(name);

    // handle varchar types
    if (type.includes('VARCHAR')) {
      colDef += ' As String';

      if (isNullable) {
        colDef += ' = Nothing';
      }
    }

    // handle int types
    else if (type.includes('INT')) {
      colDef += ' As Integer';

      if (isNullable) {
        colDef += '?';
      }
    }

    // handle smallint types
    else if (type.includes('SMALLINT')) {
      colDef += ' As Short';

      if (isNullable) {
        colDef += '?';
      }
    }

    // handle date types
    else if (type.includes('DATE')) {
      colDef += ' As Date';

      if (isNullable) {
        colDef += '?';
      }
    }

    // handle bit types
    else if (type.includes('BIT')) {
      colDef += ' As Boolean';

      if (isNullable) {
        colDef += '?';
      }
    }
    columnDefs.push(colDef);
  }
  return columnDefs;
}

export function snakeToCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}
