import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req
} from '@nestjs/common';
import { CreateEventDto } from 'src/events/dto/create-event.dto';
import { BeneficiariesService } from './beneficiaries.service';


@Controller('beneficiaries')
export class BeneficiariesController {

    constructor(private bs:BeneficiariesService){}

    // @Get('/list')
    // public async getAgList(
    //   @Body() request: Record<string, any>,
    //   @Req() req:any
    // ) {
    //    return this.bs.getAgList(request,req);
    // }
    
  @Post('/create')
  create(@Body() createEventDto: CreateEventDto) {
    return this.bs.create(createEventDto);
  }

  @Post()
  findAll(@Body() request: Record<string, any>,
  @Req() req:any) {
    return this.bs.findAll(request,req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bs.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() request: Record<string, any>) {
    return this.bs.update(+id, request);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bs.remove(+id);
  }
}
