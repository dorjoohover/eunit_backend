// platform-auth.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlatformAuthService {
  private token: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(private readonly http: HttpService) {}

  async getToken(): Promise<string> {
    // Token байхгүй эсвэл хугацаа дууссан бол refresh хийх
    if (
      !this.token ||
      (this.tokenExpiresAt && Date.now() >= this.tokenExpiresAt)
    ) {
      await this.refreshToken();
    }
    return this.token;
  }

  private async refreshToken() {
    const res = await this.http.axiosRef.post(
      `${process.env.PLATFORM}auth/login`,
      {
        username: process.env.PLATFORM_USER,
        password: process.env.PLATFORM_PASS,
      },
    );
    const data = res.data.payload;
    console.log(data);
    this.token = data.accessToken;
    this.tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000; // жишээ нь 3600 сек = 1 цаг
  }
}
