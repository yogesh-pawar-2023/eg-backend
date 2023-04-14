import { HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { response } from 'express';
import { lastValueFrom, map } from 'rxjs';
import { GeolocationService } from './geolocation.service';

interface Cat {
  name: string;
  age: number;
  breed: string;
}

@Controller('/states')
export class GeolocationController {
  public url = 'http://localhost:8080/v1/graphql';
  constructor(private geolocationService: GeolocationService) {}

  // users/list API filter pagination
  @Post('/list')
  public async searchAttendance(@Body() request: Record<string, any>) {
    const { filters, table_name } = request;
    const tableName = table_name ? table_name : 'states';
    const response = await this.geolocationService.findAll(tableName, filters);
    let mappedResponse = response?.data[tableName];
    const count = response?.data[`${tableName}_aggregate`]?.aggregate?.count;

    return {
      statusCode: 200,
      message: 'Ok.',
      totalCount: count,
      data: mappedResponse,
    };
  }
}
