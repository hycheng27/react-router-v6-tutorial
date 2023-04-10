import React, { useState } from 'react';
import { snakeToCamelCase, snakeToPascalCase } from '../utils/codeUtil';
import { getColumnDefinitions } from '../utils/vbModel';

export default function VbModel() {
  const [tableDefInput, setTableDefInput] = useState('');
  const [vbClassOutput, setVbClassOutput] = useState('');

  const convertTableDefToVbClass = () => {
    let lines = tableDefInput.split('\n');

    // get table name from first line
    const subStrStart = lines[0].indexOf('[dbo].[') + '[dbo].['.length;
    const subStrEnd = lines[0].indexOf('] (');
    const tableName = lines[0].substring(subStrStart, subStrEnd);

    // process column definitions
    const colLinesInput = lines.filter((line) => line.includes('NULL'));
    const colDefs = getColumnDefinitions(colLinesInput);

    // define the class fields (columns)
    const columns = colDefs.map((def) => `\t${def.parsedStr}`);

    // define the class constructor parameters
    const constructorParams = colDefs.map((def) => {
      if (def.isNullable) {
        if (def.parsedType === 'String') {
          return `\t\tOptional ${snakeToCamelCase(def.parsedName)} As String = Nothing,`;
        } else {
          return `\t\tOptional ${def.parsedName}? As ${def.parsedType} = Nothing,`;
        }
      } else {
        return `\t\t${def.parsedName} As ${def.parsedType},`;
      }
    });

    // remove the comma from the last constructor param
    constructorParams[constructorParams.length - 1] = constructorParams[constructorParams.length - 1].replace(',', '');

    // define the class initializers
    const initializers = colDefs.map((def) => `\t\tMe.${def.parsedName} = ${def.parsedName}`);

    // summarize the output
    let finalOutput = [
      `Public Class ${snakeToPascalCase(tableName.substring(4).replace('table', 'model'))} {`,
      ...columns,
      '',
      '\tPublic Sub New(',
      ...constructorParams,
      '\t)',
      ...initializers,
      '\tEnd Sub',
      '}',
    ];

    setVbClassOutput(finalOutput.join('\n'));
  };

  return (
    <div id="vb-model" style={{ display: 'flex', flexDirection: 'column' }}>
      <p>Paste your model here</p>
      <textarea
        placeholder="Your vb model here..."
        rows="15"
        cols="40"
        style={{ margin: 5 }}
        value={tableDefInput}
        onChange={(e) => setTableDefInput(e.target.value)}
      ></textarea>

      <div style={{ display: 'flex' }}>
        <button onClick={convertTableDefToVbClass}>Convert</button>

        <button style={{ color: '#f44250' }} onClick={() => setTableDefInput('')}>
          Clear
        </button>
      </div>

      <p>Your Result:</p>
      <textarea
        placeholder="Your vb class result here..."
        rows="15"
        cols="40"
        style={{ margin: 5 }}
        value={vbClassOutput}
        onChange={(e) => setVbClassOutput(e.target.value)}
      ></textarea>

      <div style={{ display: 'flex' }}>
        <button style={{ color: '#3704ee' }} onClick={convertTableDefToVbClass}>
          Copy
        </button>

        <button style={{ color: '#f44250' }} onClick={() => setVbClassOutput('')}>
          Clear
        </button>
      </div>

      <div style={{ padding: 30 }}></div>
    </div>
  );
}
