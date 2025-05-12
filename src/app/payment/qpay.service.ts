import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable()
export class QpayService {
  private readonly baseUrl = 'https://merchant.qpay.mn/v2'; // Update to the correct QPay API base URL
  private accessToken: string | null = null;
  private expiresAt = 0;
  private refreshing: Promise<string> | null = null;
  constructor(private readonly httpService: HttpService) {}
  public async loginQpay(): Promise<{ token: string; expiredIn: number }> {
    const now = Date.now();

    if (now < this.expiresAt + 3600000 * 24 && this.accessToken) {
      return {
        token: this.accessToken,
        expiredIn: Math.floor((this.expiresAt - now) / 1000),
      };
    }

    if (this.refreshing) {
      const token = await this.refreshing;
      return {
        token,
        expiredIn: Math.floor((this.expiresAt - Date.now()) / 1000),
      };
    }

    this.refreshing = this._getNewToken().finally(() => {
      this.refreshing = null;
    });

    const token = await this.refreshing;
    return {
      token,
      expiredIn: Math.floor((this.expiresAt - Date.now()) / 1000),
    };
  }

  private async _getNewToken(): Promise<string> {
    const now = Date.now();

    try {
      const response = await this.httpService
        .post(
          `${this.baseUrl}/auth/token`,
          {},
          {
            auth: {
              username: process.env.QPAY_CLIENT_ID,
              password: process.env.QPAY_CLIENT_SECRET,
            },
          },
        )
        .toPromise();
      const tokenData = response.data;
      this.accessToken = tokenData.access_token;
      this.expiresAt = now;

      return this.accessToken;
    } catch (error) {
      this.accessToken = null;
      this.expiresAt = 0;
      const axiosError = error as AxiosError;
      throw new HttpException(
        axiosError.response?.data || 'Authentication failed',
        500,
      );
    }
  }
  // async getAccessToken() {
  //   if (this.accessToken != null) return this.accessToken;
  //   const response = await this.httpService
  //     .post(
  //       `${this.baseUrl}/auth/token`,
  //       {},
  //       {
  //         auth: {
  //           username: process.env.QPAY_CLIENT_ID,
  //           password: process.env.QPAY_CLIENT_SECRET,
  //         },
  //       },
  //     )
  //     .toPromise();
  //   this.accessToken = response.data.access_token;
  //   return response.data.access_token;
  // }

  async createPayment(amount: number, invoiceId: string, userId: number) {
    const { token } = await this.loginQpay();
    const response = await this.httpService
      .post(
        `${this.baseUrl}/invoice`,
        {
          invoice_code: 'BOM_MANAGEMANT_INVOICE',
          sender_invoice_no: `${invoiceId}`,
          sender_branch_code: 'eunit',
          invoice_receiver_code: `${userId}`,
          amount,
          invoice_description: 'Худалдан авалт хийлээ.',
          invoice_due_date: null,
          allow_partial: false,
          minimum_amount: null,
          allow_exceed: false,
          maximum_amount: null,
          note: null,
          callback_url: 'https://srv654666.hstgr.cloud/api/v1/qpay/callback',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .toPromise();

    return response.data;
  }

  async checkPayment(id: string) {
    const { token } = await this.loginQpay();
    const response = await lastValueFrom(
      this.httpService.post(
        `${this.baseUrl}/payment/check`,
        {
          object_type: 'INVOICE',
          object_id: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    return response.data;
  }
}
