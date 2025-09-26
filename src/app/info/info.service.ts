import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { isValidCarNumber } from 'src/base/constants';

@Injectable()
export class InfoService {
  public async car(num: string) {
    try {
      const check = isValidCarNumber(num);
      const res = await axios.post(
        `${process.env.MODEL_URL}vehicle`,
        JSON.stringify({
          num,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
}
