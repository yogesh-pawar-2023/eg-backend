import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class AdharVerificationService {

constructor(private readonly httpService: HttpService){}

    public async createOkycRequest(body,request:any,resp:any){
        const data = {};
      const  url= `${process.env.ADHAR_OKYC_URL}`;
        var config:AxiosRequestConfig = { 
            headers: { 
              'x-client-id': process.env['X-CLIENT-ID'], 
              'x-client-secret': process.env['X-CLIENT-SECRET']
            }
          };
          
          try {
            const observable = 
             this.httpService.post(url, data, config);

            const promise = observable.toPromise();

            const response = await promise;
            return  resp.status(200).json({
              success: true,
              message: 'Created KYC Request Successfully!',
              data: {data:response.data}
            })
        } catch (e) {
            console.log("post data error", e.message)
            return resp.status(404).send({
              success: false,
              status: 'Not Found',
              message: 'Not Create KYC Request',
              data: {data:e.message},
            });
        }
    }

    public async initiateOkycRequest(id:any,request:any,resp:any){
      const  url= `${process.env.ADHAR_OKYC_URL}/${id}/initiate/`;
      console.log("url",url)
        var config:AxiosRequestConfig = { 
            headers: { 
              'x-client-id': process.env['X-CLIENT-ID'], 
              'x-client-secret': process.env['X-CLIENT-SECRET'],
              'Content-Type': 'application/json'
            }
          };
          
          try {
            const result = await this.httpService.get(url, config).toPromise();          
            return  resp.status(200).json({
              success: true,
              message: 'Initiate KYC Request Successfully!',
              data: {data:result.data}
            })
        } catch (e) {
            console.log("initiate okyc data error", e.message)
            return resp.status(404).send({
              success: false,
              status: 'Not Found',
              message: 'Not Initiate KYC Request',
              data: {data:e.message},
            });
        }
    }

    public async verifyOkycRequest(id:any,body:any,request:any,resp:any){
        const  url= `${process.env.ADHAR_OKYC_URL}/${id}/verify/`;
        const data = {...body};
          var config:AxiosRequestConfig = { 
              headers: { 
                'x-client-id': process.env['X-CLIENT-ID'], 
                'x-client-secret': process.env['X-CLIENT-SECRET'],
                'Content-Type': 'application/json'
              }
            };
            
            try {
              const result = await this.httpService.post(url,data ,config).toPromise();          
              return  resp.status(200).json({
                success: true,
                message: 'Verified KYC Request Successfully!',
                data: {data:result.data}
              })
              
          } catch (e) {
              console.log("verify okyc data error", e.message)
              return resp.status(404).send({
                status: 'Not Found',
                message: 'Not Verified KYC Request',
                data: {data:e.message},
              });
          
          }
      }
      

      public async completeOkycRequest(id:any,body:any,request:any,resp:any){
        const  url= `${process.env.ADHAR_OKYC_URL}/${id}/complete/`;
        const data = {...body};
          var config:AxiosRequestConfig = { 
              headers: { 
                'x-client-id': process.env['X-CLIENT-ID'], 
                'x-client-secret': process.env['X-CLIENT-SECRET'],
                'Content-Type': 'application/json'
              }
            };
            
            try {
              const result = await this.httpService.post(url,data ,config).toPromise();          
              return  resp.status(200).json({
                success: true,
                message: 'Completed KYC Request Successfully!',
                data: {data:result.data}
              })
          } catch (e) {
              console.log("complete okyc data error", e.message)
              return resp.status(404).send({
                status: 'Not Found',
                message: 'Not Verified KYC Request',
                data: {data:e.message},
              });
          
            
          }
      }

      public async getOkycStatusRequest(id:any,shareCode:any,request:any,resp:any){
        const  url= `${process.env.ADHAR_OKYC_URL}/${id}/${shareCode}/`;
          var config:AxiosRequestConfig = { 
              headers: { 
                'x-client-id': process.env['X-CLIENT-ID'], 
                'x-client-secret': process.env['X-CLIENT-SECRET'],
                'Content-Type': 'application/json'
              }
            };
            
            try {
              const result = await this.httpService.get(url,config).toPromise();          
              return  resp.status(200).json({
                success: true,
                message: 'Get KYC Successfully!',
                data: {data:result.data}
              })
          } catch (e) {
            console.log("get okyc data error", e.message)
            return resp.status(404).send({
              status: 'Not Found',
              message: 'Not Get KYC Request',
              data: {data:e.message},
            });
        
          }
      }
}
