import React, { useState } from 'react';
import { snakeToCamelCase, snakeToPascalCase } from '../utils/codeUtil';
import {
  getColumnDefinitions,
  getResColumnDefinitions,
  getResModelComment,
  getColEnumsComment,
  getColEnumClassComment,
  getColEnumClassGetNameComment,
  getCommaSeparatedNamesComment,
} from '../utils/vbModel';

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

    // define the class constructor parameters
    const constructorParams = colDefs.map((def) => {
      if (def.isNullable) {
        if (def.parsedType === 'String') {
          return `Optional ${snakeToCamelCase(def.parsedName)} As String = Nothing,`;
        } else {
          return `Optional ${def.parsedName}? As ${def.parsedType} = Nothing,`;
        }
      } else {
        return `${def.parsedName} As ${def.parsedType},`;
      }
    });

    // remove the comma from the last constructor param
    constructorParams[constructorParams.length - 1] = constructorParams[constructorParams.length - 1].replace(',', '');

    // define the class initializers
    const initializers = colDefs.map((def) => `Me.${def.parsedName} = ${def.parsedName}`);

    // -- 1st part: the class model
    const modelName = snakeToPascalCase(tableName.substring(4).replace('table', 'model'));
    const classModel = [
      `Public Class ${modelName}`,
      `\tPublic Const tableName As String = "${tableName}"\n`,
      ...colDefs.filter((def) => def.name != 'id').map((def) => `\t${def.parsedStr}`),
      '',
      '\tPublic Sub New(',
      ...constructorParams.map((line) => `\t\t${line}`),
      '\t)',
      ...initializers.map((line) => `\t\t${line}`),
      '\tEnd Sub',
      'End Class',
    ];

    // -- 2nd part: the res-class model
    const resColDefs = getResColumnDefinitions(colDefs);

    // define the res-class initializers
    const resInitializers = colDefs.map((def) => {
      return [
        `If cols.Contains("${def.name}") Then`,
        `\t${def.parsedName} = IsNull(dataRow("${def.name}"), Nothing)`,
        'End If',
      ].join('\n\t\t');
    });

    const resClassModel = [
      getResModelComment(modelName),
      `Public Class Res${modelName}`,
      ...resColDefs.map((def) => `\t${def.parsedStr}`),
      '',
      '\tPublic Sub New(dataRow As DataRow)',
      '\t\tDim cols = dataRow.Table.Columns\n',
      ...resInitializers.map((line) => `\t${line}`),
      '\tEnd Sub',
      'End Class',
    ];

    // -- 3rd part: the column enums
    const colEnums = [
      getColEnumsComment(),
      `Public Enum Enum${modelName}Columns`,
      ...colDefs.map((def) => '\t' + def.parsedName),
      'End Enum',
    ];

    // -- 4th part: the column enum class
    const colEnumClass = [
      getColEnumClassComment(modelName),
      `Public Class ${modelName}Column`,
      '',
      getColEnumClassGetNameComment(modelName),
      `Public Shared ReadOnly GetName As New Dictionary(Of Enum${modelName}Columns, String) From {`,
      ...colDefs.map((def) => `\t{Enum${modelName}Columns.${def.parsedName}, "${def.name}"},`),
      '}',
      'End Class',
    ];

    // -- 5th part: the function
    const functionGetCommaSeparatedColNames = [
      getCommaSeparatedNamesComment(modelName),
      `Public Shared Function GetCommaSeparatedColNames(cols As Enum${modelName}Columns()) As String`,
      '\tDim _list = New List(Of String)',
      '\tFor Each col In cols',
      '\t\t_list.Add(GetName(col))',
      '\tNext',
      '\tDim colNames = Join(_list.ToArray(), ", ")',
      '\tReturn colNames',
      'End Function',
    ];

    // summarize the output
    let finalOutput = [
      'Imports ETS.CodeUtils\n',
      `Namespace NS${modelName}`,
      ...classModel.map((line) => `\t${line}`),
      '',
      ...resClassModel.map((line) => `\t${line}`),
      '',
      ...colEnums.map((line) => `\t${line}`),
      '',
      ...colEnumClass.map((line) => `\t${line}`),
      '',
      ...functionGetCommaSeparatedColNames.map((line) => `\t${line}`),
      ,
      'End Namespace',
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
