import { Injectable } from '@nestjs/common';
import { query, Response } from 'express';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { S3Service } from 'src/services/s3/s3.service';



@Injectable()
export class UploadFileService {

    constructor(private readonly s3Service: S3Service, private readonly hasuraService: HasuraService) { }

    async addFile(file: Express.Multer.File, id: string, response: Response) {
        const key = `${file.fieldname}${Date.now()}`;

        const fileUrl = await this.s3Service.uploadFile(file, key);

        console.log("fileUrl", fileUrl)
        if (fileUrl) {
            let provider = 's3'
            let document_sub_type = 'profile'
            let doument_type = 'profile'
            let name = key
            let query = {
                query: `mutation MyMutation {
                            insert_documents_one(object: {provider: ${provider}, document_sub_type: ${document_sub_type}, doument_type: ${doument_type}, name: ${name}}) {
                                provider
                                id
                                doument_type
                                document_sub_type,
                                name
                            }
                        }`
            }
            const hasuraService = await this.hasuraService.postData(query)

            console.log("hasuraService", hasuraService)
            if(hasuraService) {
                return response.status(200).send({
                    success: true,
                    status: 'Success',
                    message: 'File uploaded successfully!',
                    result: {key: key, fileUrl: fileUrl, data: hasuraService.data}
                })
            } else {
                return response.status(200).send({
                    success: false,
                    status: 'Success',
                    message: 'Unable to update documents db',
                    result: null
                })
            }
            
        } else {
            return response.status(200).send({
                success: false,
                status: 'Success',
                message: 'Unable to upload file',
                result: null
            })
        }
    }

    async getFile(id: string, response: Response) {
        const key = id;

        const fileUrl = await this.s3Service.getFileUrl(key);

        console.log("fileUrl", fileUrl)
        if (fileUrl) {
            return response.status(200).send({
                success: true,
                status: 'Success',
                message: 'File url fethed successfully!',
                result: { key: key, fileUrl: fileUrl }
            })
        } else {
            return response.status(200).send({
                success: false,
                status: 'Success',
                message: 'Unable to get file',
                result: null
            })
        }
    }

}
