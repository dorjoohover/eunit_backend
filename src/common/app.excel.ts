import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { existsSync, readdirSync, statSync } from 'fs';
import { basename, isAbsolute, join, resolve } from 'path';

@Injectable()
export class AppExcel {
  private readonly workbookSearchRoots = [
    resolve(process.cwd(), 'data/xlsx'),
    resolve(process.cwd(), '../data/xlsx'),
    resolve(process.cwd(), 'src/excel'),
  ];

  readExcel(
    month: string,
    url: string,
    category: number | string,
    uri?: string,
  ) {
    const workbookPath = this.resolveWorkbookPath(month, url, uri);
    const workbook = XLSX.readFile(workbookPath);
    const sheetName =
      typeof category === 'number' ? workbook.SheetNames[category] : category;

    if (!sheetName) {
      throw new Error(
        `Sheet "${category}" not found in workbook "${basename(workbookPath)}"`,
      );
    }

    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet);

    return data;
  }

  public resolveExistingPath(pathLike: string) {
    const candidates = isAbsolute(pathLike)
      ? [pathLike]
      : [
          resolve(process.cwd(), pathLike),
          resolve(process.cwd(), '..', pathLike),
        ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  public findWorkbooks(prefixes: string[]) {
    const matches = new Set<string>();

    for (const root of this.workbookSearchRoots) {
      if (!existsSync(root)) {
        continue;
      }

      for (const fileName of readdirSync(root)) {
        const normalizedFileName = fileName.toLowerCase();
        const matchesPrefix = prefixes.some((prefix) =>
          normalizedFileName.startsWith(prefix.toLowerCase()),
        );

        if (!matchesPrefix || !normalizedFileName.endsWith('.xlsx')) {
          continue;
        }

        matches.add(join(root, fileName));
      }
    }

    return [...matches].sort((left, right) => {
      const rankDiff = this.getWorkbookRank(right) - this.getWorkbookRank(left);
      if (rankDiff !== 0) {
        return rankDiff;
      }

      return statSync(right).mtimeMs - statSync(left).mtimeMs;
    });
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

  private resolveWorkbookPath(month: string, url: string, uri?: string) {
    if (uri) {
      const resolved = this.resolveExistingPath(uri);
      if (resolved) {
        return resolved;
      }
    }

    const fileName = month && url ? `data_${month}_${url}.xlsx` : undefined;
    const defaultCandidates = [
      fileName ? resolve(process.cwd(), 'data/xlsx', fileName) : undefined,
      fileName ? resolve(process.cwd(), '../data/xlsx', fileName) : undefined,
      resolve(process.cwd(), `data/${month}/unegui_data_${url}.xlsx`),
    ].filter(Boolean) as string[];

    for (const candidate of defaultCandidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    throw new Error(
      `Workbook not found. Looked for: ${
        uri ? `"${uri}" and ` : ''
      }${defaultCandidates.map((candidate) => `"${candidate}"`).join(', ')}`,
    );
  }

  private getWorkbookRank(workbookPath: string) {
    const match = basename(workbookPath)
      .toLowerCase()
      .match(/_(\d{1,2})_(\d{1,2})\.xlsx$/);

    if (!match) {
      return 0;
    }

    return Number(match[1]) * 100 + Number(match[2]);
  }
}
