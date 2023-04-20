import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import jwt_decode from 'jwt-decode';
@Injectable()
export class UserService {
  public url = process.env.HASURA_BASE_URL;
  constructor(private readonly httpService: HttpService) {}
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
              core_faciltators {
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
              }
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
      status: response.status,
      data: response.data.data.users[0],
    };
  }
}
