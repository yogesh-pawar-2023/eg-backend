import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { UserService } from 'src/user.service';

@Injectable()
export class BeneficiariesService {
    public url = process.env.HASURA_BASE_URL;

 
    constructor(private readonly httpService: HttpService,private userService:UserService ){}
    
    create(req: any) {
        // return this.hasuraService.create(this.table, req, this.returnFields);
      }
      
    public async findAll(request: any,req:any) {

        const user=await this.userService.ipUserInfo(req)
    console.log("user id==>",user.data.id)
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
                  query += `{${e}:{_eq:"${filters[e]}"} }`;
                }
              });
            }
           console.log("query",query)
            var data={
                query:`query MyQuery($limit:Int, $offset:Int) {
                    users_aggregate( where:   
                        {
                          _and: [
                              {
                                beneficiaries: {facilitator_id: {_eq: ${user.data.id}}}
                              },
                              ${query}                           
                          ]
                        }){
                          aggregate{
                            count                         
                          }                      
                            }
                    users(
                      where:
                      {
                        _and: [
                            {
                              beneficiaries: {facilitator_id: {_eq: ${user.data.id}}}
                            },
                            ${query}
                            
                        ]
                      },
                      limit: $limit,
                      offset: $offset,
                      order_by: {
                        created_at: desc
                      }
                    ) {
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
                        profile_url
                      beneficiaries {
                        id
                      }
                     
                    }
                    
                         
                  }`
            }
                        
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
              data: mappedResponse?.map((e) => ({
                ...e,
                ['program_faciltators']: e?.['program_faciltators']?.[0],
              })),
              limit,
              currentPage: page,
              totalPages: `${totalPages}`,
            };
          }    

          
 

 

  findOne(id: number) {
    // return this.hasuraService.getOne(+id, this.table, this.returnFields);
  }

  update(id: number, req: any) {
    // return this.hasuraService.update(+id, this.table, req, this.returnFields);
  }

  remove(id: number) {
    // return this.hasuraService.delete(this.table, { id: +id });
  }
}

