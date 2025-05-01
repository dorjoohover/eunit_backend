import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { CarsDto } from '../dto/create-request.dto';

@Injectable()
export class CarsService {
  predictPrice(inputData: Record<string, any>): Promise<number> {
    return new Promise((resolve, reject) => {
      const env = { ...process.env, PYTHONIOENCODING: 'utf-8' };
      // const py = spawn('python', ['src/app/request/cars/predict.py'], { env });
      const py = spawn('python3', ['src/app/request/cars/predict.py'], { env });
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
          resolve(parseFloat(result));
        } catch (err) {
          reject(new Error(`Failed to parse result: ${result}`));
        }
      });
    });
  }

  public async calculate(dto: CarsDto) {
    const res = await this.predictPrice({
      brand: dto.brand, //string
      mark: dto.mark, //string
      Engine_capacity: dto.capacity, //float
      Year_of_manufacture: dto.manufacture, //int
      Year_of_entry: dto.entry, //int
      Gearbox: dto.gearbox, //string
      Hurd: dto.hurd, //string
      Type: dto.type, //string
      Color: dto.color, //string
      Engine: dto.engine, //string
      Interior_color: dto.interior, //string
      Drive: dto.drive, //string
      Mileage: dto.mileage, //int
      Conditions: dto.conditions, //string
    });
    return res;
  }
}
