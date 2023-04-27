import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { log } from 'console';
import { lastValueFrom, map } from 'rxjs';
import { CreateUserDto } from './helper/dto/create-user.dto';
import { RegisterFacilitatorDto } from './helper/dto/register-facilitator.dto';
import { HasuraService } from './helper/hasura.service';
import { UserService } from './user.service';

@Controller('/users')
export class UserController {
  public url = process.env.HASURA_BASE_URL;
  constructor(
    private readonly httpService: HttpService,
    public hasuraService: HasuraService,
    public userService: UserService,
  ) {}

  @Get('/qualification')
  async getQualifications() {
    const data = await lastValueFrom(
      this.httpService
        .post(
          this.url,
          {
            query: `query MyQuery {
              qualification_masters {
                id
                name
              }
            }`,
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
    return data;
  }

  @Post('/create')
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  public async create(@Body() req: CreateUserDto) {
    return this.userService.create(req);
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
    query += `program_faciltators: {id: {_is_null: false}, parent_ip: {_eq: "1"}}`;
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
            id
            status
            parent_ip
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
      this.httpService
        .post(this.url, data, {
          headers: {
            'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
            'Content-Type': 'application/json',
          },
        })
        .pipe(map((res) => res.data)),
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

  // users/list by ID API filter pagination
  @Get('/info/:id')
  public async searchById(@Param('id') id: number) {
    var data = {
      query: `query searchById {        
        users_by_pk(id: ${id}) {
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
            id
            status
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
    };

    const response = await lastValueFrom(
      this.httpService
        .post(this.url, data, {
          headers: {
            'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
            'Content-Type': 'application/json',
          },
        })
        .pipe(map((res) => res.data)),
    );
    const result = response?.data?.users_by_pk;
    const mappedResponse = result;

    return {
      statusCode: 200,
      message: 'Ok.',
      data: mappedResponse,
    };
  }
  @Post('/is_user_exist')
  public async isUserExist(@Body() req: Record<string, any>) {
    // Set User table name
    const tableName = 'users';

    // Calling hasura common method find all
    const data_exist = await this.hasuraService.findAll(tableName, req);
    let response = data_exist.data.users;

    // Check wheather user is exist or not based on response
    if (response.length > 0) {
      return {
        status: 422,
        message: 'User exist',
        isUserExist: true,
      };
    } else {
      return {
        status: 200,
        message: 'User not exist',
        isUserExist: false,
      };
    }
  }

  @Put('update_facilitator/:id')
  public async updateUser(
    @Param('id') id: string,
    @Body() req: Record<string, any>,
  ) {
    return this.userService.update(id, req, 'program_faciltators');
  }

  @Post('/login')
  login(
    @Query('username') username: string,
    @Query('password') password: string,
  ) {
    return this.userService.login(username, password);
  }
  @Get('/ip_user_info')
  ipUserInfo(@Req() request: Request) {
    return this.userService.ipUserInfo(request);
  }

  @Post('/user_create')
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  public async register(
    @Body() body: RegisterFacilitatorDto,
    @Req() request: Request,
  ) {
    return this.userService.register(body, request);
  }
}
