import {
  Body,
  Controller,
  Get,
  Req
} from '@nestjs/common';
import { AgService } from './ag.service';
@Controller('ag')
export class AgController {
    constructor(private agService:AgService){}

      // ag/list API filter pagination

      
  @Get('/list')
  public async getAgList(
    @Body() request: Record<string, any>,
    @Req() req:any
  ) {
     return this.agService.getAgList(request,req);
  }
}
