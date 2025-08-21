import React from 'react';
import './Tabela.css';

const TabelaReaproveitavel = ({ columns, dados }) => {
  return (
    <div className="table-container">
      <table>
        <thead className="tabela-gerenciamento">
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>{item[col.field]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaReaproveitavel;
