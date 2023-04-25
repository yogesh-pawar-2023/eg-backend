import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import jwt_decode from 'jwt-decode';
import { UserHelper } from './helper/userHelper';
@Injectable()
export class UserService {
  public url = process.env.HASURA_BASE_URL;
  constructor(
    private readonly httpService: HttpService,
    private helper: UserHelper,
  ) {}
  public async update(userId: string, request: any, tableName: String) {
    try {
      var axios = require('axios');
      const userDataSchema = request;
      let userData = request;
      let query = '';
      Object.keys(userData).forEach((e) => {
        if (
          userData[e] &&
          userData[e] != '' &&
          Object.keys(userDataSchema).includes(e)
        ) {
          query += `${e}: "${userData[e]}", `;
        }
      });

      var data = {
        query: `mutation update($id:Int) {
            update_${tableName}(where: {id: {_eq: $id}}, _set: {${query}}) {
                affected_rows
            }
        }`,
        variables: {
          id: userId,
        },
      };
      var config = {
        method: 'post',
        url: this.url,
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      };

      const response = await axios(config);
      const result = response.data.data;
      if (response.data.data) {
        return {
          statusCode: response.status,
          message: `${tableName} details updated !`,
          data: result,
        };
      } else {
        return {
          statusCode: 400,
          message: `Erorr while updating ${tableName} !`,
          data: response.data,
        };
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: `Erorr while updating ${tableName} !`,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  public async login(username: string, password: string) {
    var axios = require('axios');
    var loginData = {
      username: username,
      password: password,
      grant_type: 'password',
      client_id: 'hasura',
    };
    var configData = {
      method: 'post',
      url: process.env.KEYCLOAK_URL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: loginData,
    };

    const response = await axios(configData);
    return response.data;
  }

  public async ipUserInfo(request: any) {
    // Get userid from  auth/login jwt token
    const authToken = request.headers.authorization;
    const decoded: any = jwt_decode(authToken);
    let keycloak_id = decoded.sub;

    var axios = require('axios');
    // Set query for getting data
    var queryData = {
      query: `query GetUserDetails($keycloak_id:uuid) {
          users(where: {keycloak_id: {_eq: $keycloak_id}}) {
            id
            first_name
            last_name
            gender
            email_id
            dob
            district_id
            created_by
            lat
            long
            mobile
            password
            aadhar_token
            address
            block_id
            block_village_id
            keycloak_id
            state_id
            updated_by
            core_faciltator {
              created_by
              device_ownership
              device_type
              id
              pan_no
              refreere
              sourcing_channel
              updated_by
              user_id
            }
            experience {
              user_id
              start_year
              end_year
              experience_in_years
              context
              context_id
              created_by
              description
              id
              institution
              organization
              role_title
              updated_by
            }
            program_faciltators {
              avaibility
              created_by
              has_social_work_exp
              id
              police_verification_done
              program_id
              social_background_verified_by_neighbours
              updated_by
              user_id
              village_knowledge_test
              status
            }
            qualifications {
              created_by
              end_year
              id
              institution
              qualification_master_id
              start_year
              updated_by
              user_id
              qualification_master {
                context
                context_id
                created_by
                id
                name
                updated_by
              }
            }
            core_faciltator {
              created_by
              device_ownership
              device_type
              id
              pan_no
              refreere
              sourcing_channel
              updated_by
              user_id
            }
          }
        }`,
      variables: { keycloak_id: keycloak_id },
    };
    // Initialize config
    var configData = {
      method: 'post',
      url: this.url,
      headers: {
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
        'Content-Type': 'application/json',
      },
      data: queryData,
    };

    const response = await axios(configData);
    return {
      status: response?.status,
      data: response?.data?.data?.users[0],
    };
  }

  public async register(body: any, request: any) {
    var axios = require('axios');
    const password = `@${this.helper.generateRandomPassword()}`;
    let username = '';
    if (!body.mobile) {
      throw new BadRequestException('Mobile Number is required !');
    }
    username = body.mobile + '@eg.local';
    var data_to_create_user = {
      enabled: 'true',
      firstName: body.first_name,
      lastName: body.last_name,
      username: username,
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false,
        },
      ],
    };
    var config = {
      method: 'post',
      url: process.env.KEYCLOAK_USER_CREATE_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.authorization,
      },
      data: data_to_create_user,
    };

    const response_of_user_create = await axios(config);
    if (response_of_user_create.headers.location) {
      const split = response_of_user_create.headers.location.split('/');
      const keycloak_id = split[split.length - 1];
      body.keycloak_id = keycloak_id;
      this.create(body);
      return {
        status: response_of_user_create.status,
        message: 'User created successfully',
        data: [
          {
            keycloak_id: keycloak_id,
            username: username,
            password: password,
          },
        ],
      };
    } else {
      throw new BadRequestException('Error while creating user !');
    }
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
        .post(
          this.url,
          {
            query: this.query(tableName, item, fields, onlyFields),
          },
          {
            headers: {
              'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
              'Content-Type': 'application/json',
            },
          },
        )
        .pipe(map((res) => res.data)),
    );
  }

  async qM(tableName: String, item: any, fields: any, onlyFields: any = []) {
    return lastValueFrom(
      this.httpService
        .post(
          this.url,
          {
            query: this.queryMulti(tableName, item, fields, onlyFields),
          },
          {
            headers: {
              'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
              'Content-Type': 'application/json',
            },
          },
        )
        .pipe(map((res) => res.data)),
    );
  }

  public getResponce = ({ data, errors }: any, tableName: any) => {
    return { [tableName]: data ? data[tableName] : errors ? errors[0] : {} };
  };

  async create(req: any) {
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
        'keycloak_id',
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
        'keycloak_id',
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
}
