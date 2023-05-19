import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { UserService } from 'src/user.service';
@Injectable()

export class AgService {
  // @Inject(UserService)
    public url = process.env.HASURA_BASE_URL;

 
constructor(private readonly httpService: HttpService,private userService:UserService ){}

    
    // public async getAgList(id:number, request){
    //     console.log("request is",id,request)

    //     return "yogesh"

    // }

   public async getAgList(request: any,req:any) {

    // const user=await this.userService.ipUserInfo(req)
// console.log("req",req.headers.authorization)
// console.log("user",user)
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
        
        console.log("filters",filters)
        console.log("query",query)
        // const user = await this.ipUserInfo(req);
        // query += `program_faciltators: {id: {_is_null: false}, parent_ip: {_eq: "${user?.data?.program_users[0]?.organisation_id}"}}`;
        // var data = {
        //   query: `query SearchAttendance($limit:Int, $offset:Int) {
        //     users_aggregate(where:{${query}}) {
        //       aggregate {
        //         count
        //       }
        //     }
        //     users(where:{${query}}, limit: $limit, offset: $offset, order_by: {created_at: desc}) {
        //       first_name
        //       id
        //       last_name
        //       dob
        //       aadhar_token
        //       address
        //       block_id
        //       block_village_id
        //       created_by
        //       district_id
        //       email_id
        //       gender
        //       lat
        //       long
        //       mobile
        //       password
        //       state_id
        //       updated_by
        //       profile_url
        //       program_users {
        //         id
        //         organisation_id
        //         academic_year_id
        //         program_id
        //         role_id
        //         status
        //         user_id
        //       }
        //       core_faciltator {
        //         created_by
        //         device_ownership
        //         device_type
        //         id
        //         pan_no
        //         refreere
        //         sourcing_channel
        //         updated_by
        //         user_id
        //       }
        //       experience {
        //         description
        //         end_year
        //         experience_in_years
        //         institution
        //         start_year
        //         organization
        //         role_title
        //         user_id
        //         type
        //       }
        //       program_faciltators {
        //         parent_ip
        //         availability
        //         has_social_work_exp
        //         id
        //         police_verification_done
        //         program_id
        //         social_background_verified_by_neighbours
        //         user_id
        //         village_knowledge_test
        //         status
        //         form_step_number
        //         created_by
        //         updated_by
        //       }
        //       qualifications {
        //         created_by
        //         end_year
        //         id
        //         institution
        //         qualification_master_id
        //         start_year
        //         updated_by
        //         user_id
        //         qualification_master {
        //           context
        //           context_id
        //           created_by
        //           id
        //           name
        //           type
        //           updated_by
        //         }
        //       }
        //       interviews {
        //         id
        //         owner_user_id
        //         end_date_time
        //         comment
        //         created_at
        //         created_by
        //         start_date_time
        //         status
        //         title
        //         updated_at
        //         updated_by
        //         user_id
        //         location_type
        //         location
        //         owner {
        //           first_name
        //           last_name
        //           id
        //         }
        //       }
        //       events {
        //         context
        //         context_id
        //         created_by
        //         end_date
        //         end_time
        //         id
        //         location
        //         location_type
        //         start_date
        //         start_time
        //         updated_by
        //         user_id
        //       }
        //       documents(order_by: {id: desc}){
        //         id
        //         user_id
        //         name
        //         doument_type
        //         document_sub_type
        //       }
        //     }}`,
        //   variables: {
        //     limit: parseInt(limit),
        //     offset: offset,
        //   },
        // };

        var data={
            query:`users(where: {beneficiaries: {facilitator_id: {_eq: 101}}}, limit: 2, offset: 0, order_by: {created_at: desc}) {
              id
              first_name
              last_name
              pincode
              aadhar_no
              dob
              }
            beneficiaries_aggregate{
            aggregate{
              count
            }
          }`,
              variables: {
                limit: parseInt(limit),
                offset: offset,
              },
        }
        
        console.log("before resp",data)
        
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
    console.log("yogesh resp",response)
    
        let result = response?.data?.users;
    
        let mappedResponse = result;
        const count = response?.data?.users_aggregate?.aggregate?.count;
        const totalPages = Math.ceil(count / limit);
    
        return {
          statusCode: 200,
          message: 'Ok.',
          totalCount: count,
          data: mappedResponse?.map((e) => ({
            ...e,
            ['program_faciltators']: e?.['program_faciltators']?.[0],
          })),
          limit,
          currentPage: page,
          totalPages: `${totalPages}`,
        };
      }
}
