import { Inject, Injectable } from '@nestjs/common';
import { HasuraService } from 'src/hasura/hasura.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  public table = 'events';
  public fillable = [
    'context',
    'context_id',
    'created_by',
    'end_date',
    'end_time',
    'location',
    'location_type',
    'start_date',
    'start_time',
    'updated_by',
    'user_id',
  ];
  public returnFields = [
    'id',
    'context',
    'context_id',
    'created_by',
    'end_date',
    'end_time',
    'location',
    'location_type',
    'start_date',
    'start_time',
    'updated_by',
    'user_id',
  ];
  constructor(private readonly hasuraService: HasuraService) {}

  create(req: any) {
    return this.hasuraService.create(this.table, req, this.returnFields);
  }

  findAll(request: any) {
    return this.hasuraService.getAll(this.table, this.returnFields, request);
  }

  findOne(id: number) {
    return this.hasuraService.getOne(+id, this.table, this.returnFields);
  }

  update(id: number, req: any) {
    return this.hasuraService.update(+id, this.table, req, this.returnFields);
  }

  remove(id: number) {
    return this.hasuraService.delete(this.table, { id: +id });
  }
}
