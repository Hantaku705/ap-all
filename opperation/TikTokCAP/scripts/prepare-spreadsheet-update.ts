import * as fs from 'fs';

const driveFilesPath = '/tmp/drive_files.txt';

const fileContent = fs.readFileSync(driveFilesPath, 'utf-8');
const lines = fileContent.trim().split('\n');

interface RowUrl { row: number; url: string; }
const rowUrls: RowUrl[] = [];

for (const line of lines) {
  const parts = line.split(';');
  const filename = parts[0];
  const fileId = parts[1];
  const match = filename.match(/row_(\d+)\./);
  if (match) {
    const row = parseInt(match[1], 10);
    const url = 'https://drive.google.com/uc?id=' + fileId;
    rowUrls.push({ row, url });
  }
}

rowUrls.sort((a, b) => a.row - b.row);

const startRow = rowUrls[0].row;
const endRow = rowUrls[rowUrls.length - 1].row;

console.log('Total rows:', rowUrls.length);
console.log('Range: G' + startRow + ':G' + endRow);

const values: string[][] = [];
for (let row = startRow; row <= endRow; row++) {
  const found = rowUrls.find(r => r.row === row);
  values.push([found ? found.url : '']);
}

const writeData = {
  range: 'ALL!G' + startRow + ':G' + endRow,
  values: values
};

fs.writeFileSync('/tmp/spreadsheet-write-data.json', JSON.stringify(writeData, null, 2));
console.log('Saved to /tmp/spreadsheet-write-data.json');
