import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class HasuraService {
  public url = process.env.HASURA_BASE_URL;
  constructor(private readonly httpService: HttpService) {}

  public async findAll(tableName: String, filters: Object = {}) {
    let query = '';
    if (filters) {
      Object.keys(filters).forEach((e) => {
        if (filters[e] && filters[e] != '') {
          query += `${e}:{_eq:"${filters[e]}"}`;
        }
      });
    }

    var data = {
      query: `query SearchUser {
        ${tableName}_aggregate(where:{${query}}) {
          aggregate {
            count
          }
        }
        ${tableName}(where:{${query}}) {
          mobile
          aadhar_token
        }}`,
    };

    return await lastValueFrom(
      this.httpService.post(this.url, data).pipe(map((res) => res.data)),
    );
  }
}
