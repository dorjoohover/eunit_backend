import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CarsDto } from '../dto/create-request.dto';
import { AppExcel } from 'src/common/app.excel';

type ComparableCar = {
  brand: string;
  mark: string;
  capacity: string;
  capacityValue: number | null;
  manufacture: number | null;
  entry: number | null;
  gearbox: string;
  hurd: string;
  color: string;
  engine: string;
  interior: string;
  drive: string;
  mileage: number | null;
  conditions: string;
  price: number;
};

@Injectable()
export class CarsService {
  private comparableListings?: ComparableCar[];

  constructor(private readonly excel: AppExcel) {}

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

  private normalizeText(value: unknown) {
    return `${value ?? ''}`
      .trim()
      .toLowerCase()
      .replace(/[\r\n]+/g, ' ')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');
  }

  private parseNumber(value: unknown) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    const normalized = this.normalizeText(value).replace(/,/g, '');
    if (!normalized) {
      return null;
    }

    const matches = normalized.match(/\d+(\.\d+)?/g);
    if (!matches?.length) {
      return null;
    }

    const numbers = matches
      .map(Number)
      .filter((number) => !Number.isNaN(number));
    if (!numbers.length) {
      return null;
    }

    if (numbers.length === 1) {
      return numbers[0];
    }

    return numbers.reduce((sum, number) => sum + number, 0) / numbers.length;
  }

  private parsePrice(value: unknown) {
    const parsed = this.parseNumber(value);
    return parsed == null ? null : Math.round(parsed);
  }

  private parseYear(value: unknown) {
    const parsed = this.parseNumber(value);
    if (parsed == null) {
      return null;
    }

    return Math.round(parsed);
  }

  private parseMileage(value: unknown) {
    return this.parseNumber(
      `${value ?? ''}`.replace(/км/gi, '').replace(/km/gi, ''),
    );
  }

  private parseCapacityValue(value: unknown) {
    const normalized = this.normalizeText(value);

    if (!normalized) {
      return null;
    }

    if (normalized.includes('цахилгаан')) {
      return 0;
    }

    return this.parseNumber(normalized.replace(/л/g, ''));
  }

  private toComparableCar(row: Record<string, any>) {
    const price = this.parsePrice(row['price'] ?? row['Price']);
    if (price == null || price <= 0) {
      return null;
    }

    const comparable: ComparableCar = {
      brand: this.normalizeText(row['brand'] ?? row['Brand']),
      mark: this.normalizeText(row['mark'] ?? row['Mark']),
      capacity: this.normalizeText(
        row['motorCapacity'] ?? row['Motor range'] ?? row['Motor '],
      ),
      capacityValue: this.parseCapacityValue(
        row['motorCapacity'] ?? row['Motor range'] ?? row['Motor '],
      ),
      manufacture: this.parseYear(
        row['yearOfManufacturer'] ?? row['Manifactured year'],
      ),
      entry: this.parseYear(row['yearOfEntry'] ?? row['Imported year']),
      gearbox: this.normalizeText(row['gearBox'] ?? row['gearbox']),
      hurd: this.normalizeText(row['khurd'] ?? row['Hurd']),
      color: this.normalizeText(row['color'] ?? row['Color']),
      engine: this.normalizeText(row['engine'] ?? row['Engine']),
      interior: this.normalizeText(
        row['interier'] ?? row['interior'] ?? row['Interior_color'],
      ),
      drive: this.normalizeText(row['host'] ?? row['Drive']),
      mileage: this.parseMileage(row['distance'] ?? row['Distance']),
      conditions: this.normalizeText(row['condition'] ?? row['Conditions']),
      price,
    };

    if (!comparable.brand || !comparable.mark) {
      return null;
    }

    return comparable;
  }

  private getComparableListings() {
    if (this.comparableListings) {
      return this.comparableListings;
    }

    const workbookPaths = [
      ...this.excel.findWorkbooks(['car_', 'unegui_car_zarna_']),
      this.excel.resolveExistingPath(
        'src/app/request/cars/Vehicles_ML_last_v_2_5.xlsx',
      ),
    ].filter(Boolean) as string[];

    this.comparableListings = workbookPaths.flatMap((workbookPath) => {
      try {
        const rows = this.excel.readExcel('', '', 0, workbookPath) as Record<
          string,
          any
        >[];
        return rows
          .map((row) => this.toComparableCar(row))
          .filter((row): row is ComparableCar => row != null);
      } catch (error) {
        return [];
      }
    });

    return this.comparableListings;
  }

  private narrowPool(
    pool: ComparableCar[],
    predicate: (listing: ComparableCar) => boolean,
    minMatches = 3,
  ) {
    const narrowed = pool.filter(predicate);
    return narrowed.length >= minMatches ? narrowed : pool;
  }

  private exactScore(left: string, right: string, value: number) {
    if (!left || !right) {
      return 0;
    }

    return left === right ? value : 0;
  }

  private numericScore(
    left: number | null,
    right: number | null,
    maxScore: number,
    divisor: number,
  ) {
    if (left == null || right == null) {
      return 0;
    }

    return Math.max(0, maxScore - Math.abs(left - right) / divisor);
  }

  private scoreListing(input: ComparableCar, listing: ComparableCar) {
    let score = 0;

    score += this.exactScore(input.brand, listing.brand, 30);
    score += this.exactScore(input.mark, listing.mark, 24);
    score += this.exactScore(input.engine, listing.engine, 10);
    score += this.exactScore(input.gearbox, listing.gearbox, 8);
    score += this.exactScore(input.drive, listing.drive, 8);
    score += this.exactScore(input.conditions, listing.conditions, 6);
    score += this.exactScore(input.hurd, listing.hurd, 4);
    score += this.exactScore(input.color, listing.color, 2);
    score += this.exactScore(input.interior, listing.interior, 2);

    score += this.numericScore(input.manufacture, listing.manufacture, 16, 1);
    score += this.numericScore(input.entry, listing.entry, 10, 1);
    score += this.numericScore(
      input.capacityValue,
      listing.capacityValue,
      8,
      0.3,
    );
    score += this.numericScore(input.mileage, listing.mileage, 12, 25000);

    return score;
  }

  private getMedian(values: number[]) {
    if (!values.length) {
      return 0;
    }

    const sorted = [...values].sort((left, right) => left - right);
    const half = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 1
      ? sorted[half]
      : (sorted[half - 1] + sorted[half]) / 2;
  }

  private estimatePrice(listings: Array<ComparableCar & { score: number }>) {
    const sortedByPrice = [...listings].sort(
      (left, right) => left.price - right.price,
    );
    const trimSize = sortedByPrice.length > 4 ? 1 : 0;
    const trimmed =
      trimSize > 0
        ? sortedByPrice.slice(trimSize, sortedByPrice.length - trimSize)
        : sortedByPrice;

    const weightedTotal = trimmed.reduce(
      (sum, listing) => sum + listing.price * Math.max(listing.score, 1),
      0,
    );
    const totalWeight = trimmed.reduce(
      (sum, listing) => sum + Math.max(listing.score, 1),
      0,
    );

    const weightedAverage =
      totalWeight > 0 ? weightedTotal / totalWeight : (trimmed[0]?.price ?? 0);
    const median = this.getMedian(trimmed.map((listing) => listing.price));

    return Math.round((weightedAverage + median) / 2 / 1000) * 1000;
  }

  public async calculate(dto: CarsDto): Promise<number> {
    const validatedInput = {
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
      Mileage: dto.mileage,
      Conditions: dto.conditions,
    };

    this.validateInput(validatedInput);

    const input: ComparableCar = {
      brand: this.normalizeText(dto.brand),
      mark: this.normalizeText(dto.mark),
      capacity: this.normalizeText(dto.capacity),
      capacityValue: this.parseCapacityValue(dto.capacity),
      manufacture: dto.manufacture ?? null,
      entry: dto.entry ?? null,
      gearbox: this.normalizeText(dto.gearbox),
      hurd: this.normalizeText(dto.hurd),
      color: this.normalizeText(dto.color),
      engine: this.normalizeText(dto.engine),
      interior: this.normalizeText(dto.interior),
      drive: this.normalizeText(dto.drive),
      mileage: dto.mileage ?? null,
      conditions: this.normalizeText(dto.conditions),
      price: 0,
    };

    const listings = this.getComparableListings();
    if (!listings.length) {
      throw new ServiceUnavailableException(
        'Vehicle pricing data is not available.',
      );
    }

    let pool = listings;
    pool = this.narrowPool(pool, (listing) => listing.brand === input.brand);
    pool = this.narrowPool(pool, (listing) => listing.mark === input.mark);
    pool = this.narrowPool(pool, (listing) => listing.engine === input.engine);
    pool = this.narrowPool(
      pool,
      (listing) => listing.gearbox === input.gearbox,
    );
    pool = this.narrowPool(pool, (listing) => listing.drive === input.drive);
    pool = this.narrowPool(
      pool,
      (listing) =>
        listing.manufacture != null &&
        input.manufacture != null &&
        Math.abs(listing.manufacture - input.manufacture) <= 2,
    );
    pool = this.narrowPool(
      pool,
      (listing) =>
        listing.entry != null &&
        input.entry != null &&
        Math.abs(listing.entry - input.entry) <= 2,
    );

    const scoredListings = pool
      .map((listing) => ({
        ...listing,
        score: this.scoreListing(input, listing),
      }))
      .filter((listing) => listing.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 20);

    if (!scoredListings.length) {
      throw new ServiceUnavailableException(
        'No comparable vehicle listings were found for this request.',
      );
    }

    return this.estimatePrice(scoredListings);
  }
}
