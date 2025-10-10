// platform.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PlatformAuthService } from './platform.auth.service';
import { serviceValues } from 'src/base/constants';
import { VehicleInfo } from '../request/dto/create-request.dto';

@Injectable()
export class PlatformService {
  constructor(
    private readonly http: HttpService,
    private readonly authService: PlatformAuthService,
  ) {}

  async sendUsage(dto: any, service: number, vehicle: VehicleInfo) {
    try {
      const token = await this.authService.getToken();
      const { data } = await this.http.axiosRef.post(
        `${process.env.PLATFORM}usage`,
        { value: dto, service: serviceValues[service], vehicle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return data;
    } catch (error) {
      console.log(error);
    }
  }
  async getUsage(platform: string) {
    const token = await this.authService.getToken();

    const { data } = await this.http.axiosRef.get(
      `${process.env.PLATFORM}usage/get/${platform}`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(data);
    return data.payload;
  }
}
