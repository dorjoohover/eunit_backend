import * as XLSX from 'xlsx';

export class AppExcel {
  readExcel(month: string, url: string, category: number | string, uri?: string) {
    const workbook = XLSX.readFile(
      uri ?? `data/${month}/unegui_data_${url}.xlsx`,
    );
    const sheetName = workbook.SheetNames[category];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet);

    return data;
  }

  writeExcel(filePath: string, data: any[]) {
    const workbook = XLSX.utils.book_new();
    data.map((d) => {
      const worksheet = XLSX.utils.json_to_sheet(d.data);

      XLSX.utils.book_append_sheet(workbook, worksheet, d.name);
      Array.from({ length: d.data.length }, (_, i) => i++).map((a) => {
        XLSX.utils.encode_cell({ c: 9, r: a });
        XLSX.utils.encode_cell({ c: 8, r: a });
      });
    });

    XLSX.writeFile(workbook, filePath);
  }
}
