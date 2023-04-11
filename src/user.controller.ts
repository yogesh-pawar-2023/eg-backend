import { HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { AppService } from './app.service';

interface Cat {
  name: string;
  age: number;
  breed: string;
}

@Controller('/users')
export class UserController {
  public url = 'http://localhost:8080/v1/graphql';
  constructor(private readonly httpService: HttpService) {}

  @Get('/list')
  async getHello() {
    const data = await lastValueFrom(
      this.httpService
        .post(this.url, {
          query: `query MyQuery {
          users {
            first_name
            email_id
            dob
            gender
            last_name
            id
          }
        }`,
        })
        .pipe(map((res) => res.data)),
    );
    return data;
  }
  @Get('/qualification')
  async getQualifications() {
    const data = await lastValueFrom(
      this.httpService
        .post(this.url, {
          query: `query MyQuery {
            qualification_masters {
              id
              name
            }
        }`,
        })
        .pipe(map((res) => res.data)),
    );
    // console.log(data["12"]["asd"])
    return data;
  }
  queryMulti(tableName: String, items: any, fields: any, onlyFields: any = []) {
    let returnkeys = [];
    const getObjStr = (item: Object, type: String = '') => {
      let str = '[';
      items.forEach((item, pindex) => {
        const keys = Object.keys(item);
        str += '{';
        keys.forEach((e, index) => {
          if (!returnkeys.includes(e)) {
            returnkeys = [...returnkeys, e];
          }
          if (onlyFields.length < 1 || onlyFields.includes(e)) {
            if (type === 'obj') {
              str += `${e}:"${item[e]}"${keys.length > index + 1 ? ',' : ''}`;
            } else {
              str += `$${e}:String${keys.length > index + 1 ? ',' : ''}`;
            }
          }
        });
        str += `}${items.length > pindex + 1 ? ',' : ''}`;
      });
      return (str += ']');
    };

    const getParam = (keys: any) => {
      let str = '';
      keys.forEach((e: any, index: any) => {
        str += `${e}${keys.length > index + 1 ? '\n' : ''}`;
      });
      return str;
    };

    return `mutation MyQuery {
      ${tableName}(objects: ${getObjStr(items, 'obj')}) {
        returning {${getParam(fields ? fields : returnkeys)}}
      }
    }
    `;
  }

  query(tableName: String, item: Object, fields: any, onlyFields: any = []) {
    const keys = Object.keys(item);
    const getObjStr = (item: Object, type: String = '') => {
      let str = '';
      keys.forEach((e, index) => {
        if (onlyFields.length < 1 || onlyFields.includes(e)) {
          if (type === 'obj') {
            str += `${e}:"${item[e]}"${keys.length > index + 1 ? ',' : ''}`;
          } else {
            str += `$${e}:String${keys.length > index + 1 ? ',' : ''}`;
          }
        }
      });
      return str;
    };

    const getParam = (keys: any) => {
      let str = '';
      keys.forEach((e: any, index: any) => {
        str += `${e}${keys.length > index + 1 ? '\n' : ''}`;
      });
      return str;
    };

    return `mutation MyQuery {
      ${tableName}(object: {${getObjStr(item, 'obj')}}) {
        ${getParam(fields ? fields : keys)}
      }
    }
    `;
  }

  async q(tableName: String, item: Object, fields: any, onlyFields: any = []) {
    return lastValueFrom(
      this.httpService
        .post(this.url, {
          query: this.query(tableName, item, fields, onlyFields),
        })
        .pipe(map((res) => res.data)),
    );
  }
  

  async qM(tableName: String, item: any, fields: any, onlyFields: any = []) {
    return lastValueFrom(
      this.httpService
        .post(this.url, {
          query: this.queryMulti(tableName, item, fields, onlyFields),
        })
        .pipe(map((res) => res.data)),
    );
  }

  @Post('/create')
  async create(@Body() req: Record<string, any>) {
    // console.log(req)
    let i = 0,
      response = [];
    const tableName = 'insert_users_one';
    const data = await this.q(
      tableName,
      req,
      [
        'id',
        'first_name',
        'last_name',
        'mobile',
        'email_id',
        'gender',
        'dob',
        'address',
        'aadhar_token',
      ],
      [
        'first_name',
        'last_name',
        'mobile',
        'email_id',
        'gender',
        'dob',
        'address',
        'aadhar_token',
      ],
    );
    const newR = data['data'][tableName];
    response[i++] = newR;
    const qualificationTableName = 'insert_qualifications_one';
    const qualification = await this.q(
      qualificationTableName,
      { qualification_master_id: 1, user_id: newR?.id },
      ['id', 'qualification_master_id', 'user_id'],
    );
    // console.log(qualification)
    response[i++] = qualification['data'][qualificationTableName];

    const programFaciltatorsTableName = 'insert_core_faciltators_one';
    const { device_type, device_ownership } = req;
    const programFaciltators = await this.q(
      programFaciltatorsTableName,
      { device_type, device_ownership, user_id: newR?.id },
      ['id', 'device_type', 'device_ownership', 'user_id'],
    );
    response[i++] = programFaciltators['data'][programFaciltatorsTableName];

    const coreFaciltatorsTableName = 'insert_program_faciltators_one';
    const { avaibility } = req;
    const coreFaciltators = await this.q(
      coreFaciltatorsTableName,
      { avaibility, user_id: newR?.id },
      ['id', 'avaibility', 'user_id'],
    );
    response[i++] = coreFaciltators['data'][coreFaciltatorsTableName];
  
    if (req['experience']) {
      const experienceTableName = 'insert_experience';
      const experience = await this.qM(
        experienceTableName,
        req['experience'],
        [
          'description',
          'user_id',
          'role_title',
          'organization',
          'institution',
          'experience_in_years',
        ],
        [
          'description',
          'user_id',
          'role_title',
          'organization',
          'institution',
          'experience_in_years',
        ],
      );
      response[i++] = experience['data'][experienceTableName];
    }

    return response;
  }

  async QueryFilter(tableName,filter,sort){
    let keys = Object.keys(filter);
    let sortkey = `{${Object.keys(sort)[0]}:${sort[Object.keys(sort)[0]]}}`;
    let fq = "";
    keys.forEach((item,index) => {
    fq += `{${item}:{_ilike:${filter[item]}}}${keys.length > index +1 ? ",":""}`
    });
return `query MyQuery{
  ${tableName}(where ${fq}, _order_by:${sortkey})
}`
  }
}
