import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class QpayService {
  private readonly baseUrl = 'https://merchant.qpay.mn/v2'; // Update to the correct QPay API base URL
  private token = null;
  constructor(private readonly httpService: HttpService) {}

  async getAccessToken() {
    if (this.token != null) return this.token;
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
    this.token = response.data.access_token;
    return response.data.access_token;
  }

  async createPayment(amount: number, invoiceId: string, userId: number) {
    const accessToken = await this.getAccessToken();

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
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      .toPromise();

    return response.data;
  }

  async checkPayment(id: string) {
    const accessToken = await this.getAccessToken();
    const response = await lastValueFrom(
      this.httpService.post(
        `${this.baseUrl}/payment/check`,
        {
          object_type: 'INVOICE',
          object_id: id,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    console.log(response.data);
    return response.data;
  }
}
