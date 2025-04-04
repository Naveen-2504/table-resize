import React, { useState, useRef } from "react";


const defaultColumns = [
  { id: 1, label: "Name", width: 150 },
  { id: 2, label: "Age", width: 100 },
  { id: 3, label: "Location", width: 200 },
];
const defaultRows = [{ id: 1, height: 40 }, { id: 2, height: 40 }, { id: 3, height: 40 }];

const DynamicTable = () => {
  const [columns, setColumns] = useState(defaultColumns);
  const [rows, setRows] = useState(defaultRows);
  const [cellData, setCellData] = useState({});
  const [mergedRegions, setMergedRegions] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const resizingColumn = useRef(null);
  const resizingRow = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const handleColumnMouseDown = (e, index) => {
    resizingColumn.current = index;
    startX.current = e.clientX;
    startWidth.current = columns[index].width;
    document.addEventListener("mousemove", handleColumnMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleColumnMouseMove = (e) => {
    if (resizingColumn.current === null) return;
    const deltaX = e.clientX - startX.current;
    const newWidth = Math.max(20, startWidth.current + deltaX);
    setColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[resizingColumn.current].width = newWidth;
      return updatedColumns;
    });
  };

  const handleRowMouseDown = (e, index) => {
    resizingRow.current = index;
    startY.current = e.clientY;
    startHeight.current = rows[index].height;
    document.addEventListener("mousemove", handleRowMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleRowMouseMove = (e) => {
    if (resizingRow.current === null) return;
    const deltaY = e.clientY - startY.current;
    const newHeight = Math.max(25, startHeight.current + deltaY);
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows[resizingRow.current].height = newHeight;
      return updatedRows;
    });
  };

  const handleMouseUp = () => {
    resizingColumn.current = null;
    resizingRow.current = null;
    document.removeEventListener("mousemove", handleColumnMouseMove);
    document.removeEventListener("mousemove", handleRowMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleCellSelect = (rowIndex, colIndex) => {
    const key = `${rowIndex}-${colIndex}`;
    setSelectedCells((prev) => {
      if (prev.includes(key)) return prev.filter((arr) => arr !== key);
      return [...prev, key];
    });
  };

  const handleMerge = () => {
    if (selectedCells.length < 2) return;
    const indices = selectedCells.map((key) => key.split("-").map(Number));
    const rowsSet = new Set(indices.map(([arr]) => arr));
    const colsSet = new Set(indices.map(([, arr]) => arr));
    const minRow = Math.min(...rowsSet);
    const maxRow = Math.max(...rowsSet);
    const minCol = Math.min(...colsSet);
    const maxCol = Math.max(...colsSet);
    setMergedRegions((prev) => [...prev, { row: minRow, col: minCol, rowspan: maxRow - minRow + 1, colspan: maxCol - minCol + 1 }]);
    setSelectedCells([]);
  };

  const handleUnmerge = (row, col) => {
    setMergedRegions((prev) => prev.filter(arr => !(arr.row === row && arr.col === col)));
  };

  const handleCellChange = (e, row, col) => {
    const key = `${row}-${col}`;
    setCellData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const renderCell = (rowIndex, colIndex) => {
    const key = `${rowIndex}-${colIndex}`;
    const region = mergedRegions.find(arr => arr.row === rowIndex && arr.col === colIndex);
    if (region) {
      return (
        <td
          key={key}
          rowSpan={region.rowspan}
          colSpan={region.colspan}
          className="border border-gray-300 text-center align-middle"
          onClick={() => handleUnmerge(rowIndex, colIndex)}
        >
          <input
            className="w-full text-center bg-transparent outline-none"
            value={cellData[key] || ""}
            onChange={(e) => handleCellChange(e, rowIndex, colIndex)}
          />
        </td>
      );
    }
    if (mergedRegions.some(arr =>
      rowIndex >= arr.row && rowIndex < arr.row + arr.rowspan &&
      colIndex >= arr.col && colIndex < arr.col + arr.colspan &&
      !(arr.row === rowIndex && arr.col === colIndex))) {
      return null;
    }
    return (
      <td
        key={key}
        className={`border border-gray-300 px-2 text-center cursor-pointer ${selectedCells.includes(key) ? "bg-yellow-200" : ""}`}
        onClick={() => handleCellSelect(rowIndex, colIndex)}
      >
        <input
          className="w-full text-center bg-transparent outline-none"
          value={cellData[key] || ""}
          onChange={(e) => handleCellChange(e, rowIndex, colIndex)}
        />
      </td>
    );
  };

  return (
    <div className="overflow-x-auto p-4">
      <button
        className="mb-2 px-4 py-1 bg-blue-600 text-white rounded"
        onClick={handleMerge}
      >
        Merge Selected
      </button>
      <table className="border-collapse border border-gray-300 w-full">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={col.id}
                className="border border-gray-300 relative bg-gray-100 text-left px-2"
                style={{ width: col.width }}
              >
                <div className="flex items-center justify-between">
                  <span>{col.label}</span>
                  <div
                    className="w-1 cursor-col-resize bg-gray-500 hover:bg-gray-700 h-full absolute right-0 top-0 bottom-0"
                    onMouseDown={(e) => handleColumnMouseDown(e, index)}
                  ></div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id} style={{ height: row.height }} className="relative">
              {columns.map((col, colIndex) => renderCell(rowIndex, colIndex))}
              <td
                className="h-1 cursor-row-resize bg-gray-500 hover:bg-gray-700 absolute bottom-0 left-0 right-0"
                onMouseDown={(e) => handleRowMouseDown(e, rowIndex)}
              ></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;