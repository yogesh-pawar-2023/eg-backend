import { HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';

interface Cat {
  name: string;
  age: number;
  breed: string;
}

@Controller('/users')
export class UserController {
  public url = 'http://localhost:8080/v1/graphql';
  constructor(private readonly httpService: HttpService) {}

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

  public getResponce = ({ data, errors }: any, tableName: any) => {
    return { [tableName]: data ? data[tableName] : errors ? errors[0] : {} };
  };

  @Post('/create')
  async create(@Body() req: Record<string, any>) {
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
    const newR = this.getResponce(data, tableName);
    const user_id = newR[tableName]?.id;
    response[i++] = newR;
    if (user_id) {
      const qualificationTableName = 'insert_qualifications_one';
      const qualification = await this.q(
        qualificationTableName,
        {
          ...req,
          qualification_master_id: req.qualification_master_id
            ? req.qualification_master_id
            : 1,
          user_id,
        },
        ['id', 'qualification_master_id', 'user_id'],
        [
          'qualification_master_id',
          'start_year',
          'end_year',
          'institution',
          'user_id',
        ],
      );
      console.log(qualification);
      response[i++] = this.getResponce(qualification, qualificationTableName);

      const programFaciltatorsTableName = 'insert_core_faciltators_one';
      const programFaciltators = await this.q(
        programFaciltatorsTableName,
        { ...req, user_id },
        ['id', 'device_type', 'device_ownership', 'user_id'],
        ['pan_no', 'device_type', 'device_ownership', 'user_id'],
      );
      response[i++] = this.getResponce(
        programFaciltators,
        programFaciltatorsTableName,
      );

      const coreFaciltatorsTableName = 'insert_program_faciltators_one';
      const coreFaciltators = await this.q(
        coreFaciltatorsTableName,
        { ...req, user_id },
        ['id', 'avaibility', 'user_id'],
        [
          'avaibility',
          'program_id',
          'has_social_work_exp',
          'social_background_verified_by_neighbours',
          'village_knowledge_test',
          'police_verification_done',
          'user_id',
        ],
      );
      response[i++] = this.getResponce(
        coreFaciltators,
        coreFaciltatorsTableName,
      );

      if (req['experience']) {
        const experienceTableName = 'insert_experience';
        const experience = await this.qM(
          experienceTableName,
          req['experience'].map((e: Object) => {
            return { ...e, user_id };
          }),
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
            'start_year',
            'end_year',
            'experience_in_years',
          ],
        );
        response[i++] = this.getResponce(experience, experienceTableName);
      }
    }

    return response;
  }

  async QueryFilter(tableName, filter, sort) {
    let keys = Object.keys(filter);
    let sortkey = `{${Object.keys(sort)[0]}:${sort[Object.keys(sort)[0]]}}`;
    let fq = '';
    keys.forEach((item, index) => {
      fq += `{${item}:{_ilike:${filter[item]}}}${
        keys.length > index + 1 ? ',' : ''
      }`;
    });
    return `query MyQuery{
  ${tableName}(where ${fq}, _order_by:${sortkey})
}`;
  }

  // users/list API filter pagination
  @Post('/list')
  public async searchAttendance(@Body() request: Record<string, any>) {
    const { filters } = request;
    const page = request.page ? request.page : '1';
    const limit = request?.limit ? request?.limit : '10';

    let offset = 0;
    if (page > 1 && limit) {
      offset = parseInt(limit) * (page - 1);
    }

    let query = '';
    if (filters) {
      Object.keys(filters).forEach((e) => {
        if (filters[e] && filters[e] != '') {
          query += `${e}:{_eq:"${filters[e]}"}`;
        }
      });
    }

    var data = {
      query: `query SearchAttendance($limit:Int, $offset:Int) {
        users_aggregate(where:{${query}}) {
          aggregate {
            count
          }
        }
        users(where:{${query}}, limit: $limit, offset: $offset) {
          first_name
          id
          last_name
          dob
          aadhar_token
          address
          block_id
          block_village_id
          created_by
          district_id
          email_id
          gender
          lat
          long
          mobile
          password
          state_id
          updated_by
          core_faciltator {
            device_ownership
            device_type
            id
            pan_no
            user_id
          }
          experience {
            description
            end_year
            experience_in_years
            institution
            start_year
            organization
            role_title
            user_id
          }
          program_faciltators {
            avaibility
            has_social_work_exp
            id
            police_verification_done
            program_id
            user_id
            social_background_verified_by_neighbours
          }
          qualifications {
            end_year
            id
            institution
            start_year
            user_id
            qualification_master {
              name
              id
            }
          }
        }}`,
      variables: {
        limit: parseInt(limit),
        offset: offset,
      },
    };

    const response = await lastValueFrom(
      this.httpService.post(this.url, data).pipe(map((res) => res.data)),
    );
    let result = response?.data?.users;

    let mappedResponse = result;
    const count = response?.data?.users_aggregate?.aggregate?.count;
    const totalPages = Math.ceil(count / limit);

    return {
      statusCode: 200,
      message: 'Ok.',
      totalCount: count,
      data: mappedResponse,
      limit,
      currentPage: page,
      totalPages: `${totalPages}`,
    };
  }
}
