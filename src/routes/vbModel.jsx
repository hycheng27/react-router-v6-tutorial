import React, { useState } from 'react';
import { getColumnDefinitions } from '../utils/vbModel';

export default function VbModel() {
  const [tableDefInput, setTableDefInput] = useState('');
  const [vbClassOutput, setVbClassOutput] = useState('');

  const convertTableDefToVbClass = () => {
    let lines = tableDefInput.split('\n');
    lines = lines.filter((line) => line.includes('NULL'));

    setVbClassOutput(getColumnDefinitions(lines).join('\n'));
  };

  return (
    <div id='vb-model' style={{ display: 'flex', flexDirection: 'column' }}>
      <p>Paste your model here</p>
      <textarea
        placeholder='Your vb model here...'
        rows='5'
        cols='40'
        style={{ margin: 5 }}
        value={tableDefInput}
        onChange={(e) => setTableDefInput(e.target.value)}
      ></textarea>

      <div style={{ display: 'flex' }}>
        <button onClick={convertTableDefToVbClass}>Convert</button>

        <button
          style={{ color: '#f44250' }}
          onClick={() => setTableDefInput('')}
        >
          Clear
        </button>
      </div>

      <p>Your Result:</p>
      <textarea
        placeholder='Your vb class result here...'
        rows='15'
        cols='40'
        style={{ margin: 5 }}
        value={vbClassOutput}
        onChange={(e) => setVbClassOutput(e.target.value)}
      ></textarea>

      <div style={{ display: 'flex' }}>
        <button style={{ color: '#3704ee' }} onClick={convertTableDefToVbClass}>
          Copy
        </button>

        <button
          style={{ color: '#f44250' }}
          onClick={() => setTableDefInput('')}
        >
          Clear
        </button>
      </div>

      <div style={{ padding: 30 }}></div>
    </div>
  );
}
