import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';

@Controller('/locationmaster')
export class GeolocationController {
  constructor(private geolocationService: GeolocationService) {}

  // states list API filter pagination
  @Post('/states')
  public async states(@Body() request: Record<string, any>) {
    const { filters } = request;
    const tableName = 'address';
    const response = await this.geolocationService.states();
    let mappedResponse = response?.data[tableName];
    const count = response?.data[`${tableName}_aggregate`]?.aggregate?.count;

    return {
      statusCode: 200,
      message: 'Ok.',
      totalCount: count,
      data: mappedResponse,
    };
  }
  // districts list API filter pagination
  @Post('/districts/:name')
  public async districts(
    @Param('name') name: string,
    state_id: string,
    @Body() request: Record<string, any>,
  ) {
    const tableName = 'address';
    const response = await this.geolocationService.districts(name);
    let mappedResponse = response?.data[tableName];
    const count = response?.data[`${tableName}_aggregate`]?.aggregate?.count;

    return {
      statusCode: 200,
      message: 'Ok.',
      totalCount: count,
      data: mappedResponse,
    };
  }
  // blocks list API filter pagination
  @Post('/blocks/:name')
  public async blocks(
    @Param('name') name: string,
    @Body() request: Record<string, any>,
  ) {
    const tableName = 'address';
    const response = await this.geolocationService.blocks(name);
    let mappedResponse = response?.data[tableName];
    const count = response?.data[`${tableName}_aggregate`]?.aggregate?.count;

    return {
      statusCode: 200,
      message: 'Ok.',
      totalCount: count,
      data: mappedResponse,
    };
  }

  // villages list API filter pagination
  @Post('/villages/:name')
  public async villages(
    @Param('name') name: string,
    @Body() request: Record<string, any>,
  ) {
    const tableName = 'address';
    const response = await this.geolocationService.villages(name);
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
