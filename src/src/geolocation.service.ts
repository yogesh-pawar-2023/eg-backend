import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class GeolocationService {
  public url = 'http://localhost:8080/v1/graphql';
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
      query: `query SearchAttendance {
        ${tableName}_aggregate(where:{${query}}) {
          aggregate {
            count
          }
        }
        ${tableName}(where:{${query}}) {
          id
          name
        }}`,
    };

    return await lastValueFrom(
      this.httpService.post(this.url, data).pipe(map((res) => res.data)),
    );
  }
}
