import { Injectable, BadRequestException } from '@nestjs/common';
import { spawn } from 'child_process';
import { CarsDto } from '../dto/create-request.dto';

@Injectable()
export class CarsService {
  private validateInput(input: Record<string, any>): void {
    const requiredFields = [
      'brand',
      'mark',
      'Year_of_manufacture',
      'Year_of_entry',
      'Engine_capacity',
      'Engine',
      'Gearbox',
      'Hurd',
      'Drive',
      'Color',
      'Interior_color',
      'Conditions',
      'Mileage',
    ];

    for (const field of requiredFields) {
      if (
        !(field in input) ||
        input[field] === undefined ||
        input[field] === null
      ) {
        throw new BadRequestException(`Missing or invalid field: ${field}`);
      }
    }

    if (
      !Number.isInteger(input.Year_of_manufacture) ||
      input.Year_of_manufacture < 1900
    ) {
      throw new BadRequestException(
        'Year_of_manufacture must be a valid integer year',
      );
    }

    if (
      !Number.isInteger(input.Year_of_entry) ||
      input.Year_of_entry < input.Year_of_manufacture
    ) {
      throw new BadRequestException(
        'Year_of_entry must be >= Year_of_manufacture',
      );
    }

    if (
      typeof input.Mileage !== 'number' &&
      typeof input.Mileage !== 'string'
    ) {
      throw new BadRequestException('Mileage must be a number or string');
    }

    if (typeof input.Mileage === 'string') {
      if (!/^\d+$|^\d+-\d+$|^300000$/.test(input.Mileage)) {
        throw new BadRequestException(
          "Mileage must be a number, range (e.g., '0-5000'), or '300000'",
        );
      }
    }

    const validConditions = ['00 гүйлттэй', 'Дугаар авсан', 'Дугаар аваагүй'];
    if (!validConditions.includes(input.Conditions)) {
      throw new BadRequestException(
        `Conditions must be one of: ${validConditions.join(', ')}`,
      );
    }

    const stringFields = [
      'brand',
      'mark',
      'Engine_capacity',
      'Engine',
      'Gearbox',
      'Hurd',
      'Drive',
      'Color',
      'Interior_color',
    ];
    for (const field of stringFields) {
      if (typeof input[field] !== 'string' || input[field].trim() === '') {
        throw new BadRequestException(`${field} must be a non-empty string`);
      }
    }
  }

  private predictPrice(inputData: Record<string, any>): Promise<number> {
    return new Promise((resolve, reject) => {
      const env = { ...process.env, PYTHONIOENCODING: 'utf-8' };
      // const py = spawn('python', ['src/app/request/cars/predict.py'], { env });
      const py = spawn(
        '/home/hstgr-dev-srv654666/htdocs/dev.srv654666.hstgr.cloud/backend/venv/bin/python',
        ['src/app/request/cars/predict.py'],
        { env },
      );

      let result = '';

      py.stdin.write(JSON.stringify(inputData));
      py.stdin.end();

      py.stdout.on('data', (data) => {
        result += data.toString();
      });

      py.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
      });

      py.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Python process exited with code ${code}`));
        }
        try {
          const parsed =
            typeof result === 'string' ? JSON.parse(result) : result;
          const price = parsed['predicted_price'];
          resolve(parseFloat(price));
        } catch (err) {
          reject(new Error(`Failed to parse result: ${result}`));
        }
      });
    });
  }
  public getPriceRange(
    price: number,
    step: number = 5000,
    maxCap: number = 500000,
  ): string {
    if (price >= maxCap) return `${maxCap - step}-${maxCap}`;

    const lower = Math.floor(price / step) * step;
    const upper = lower + step;
    return `${lower}-${upper}`;
  }

  public async calculate(dto: CarsDto): Promise<number> {
    const input = {
      brand: dto.brand,
      mark: dto.mark,
      Engine_capacity: dto.capacity,
      Year_of_manufacture: dto.manufacture,
      Year_of_entry: dto.entry,
      Gearbox: dto.gearbox,
      Hurd: dto.hurd,
      Color: dto.color,
      Engine: dto.engine,
      Interior_color: dto.interior,
      Drive: dto.drive,
      Mileage: this.getPriceRange(dto.mileage),
      Conditions: dto.conditions,
    };

    this.validateInput(input); // ✅ Perform validation before prediction
    const predict = await this.predictPrice(input);
    console.log(predict);
    return predict;
  }
}
