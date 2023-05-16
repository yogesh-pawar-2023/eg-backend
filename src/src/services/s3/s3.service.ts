import { Injectable } from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandInput,
    PutObjectCommandOutput,
    GetObjectCommand
} from "@aws-sdk/client-s3";
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
    private region: string;
    private s3: S3Client;

    constructor(private configService: ConfigService) {
        this.region = this.configService.get<string>('S3_REGION')
        this.s3 = new S3Client({
            region: this.region,
            credentials: {
                secretAccessKey: this.configService.get<string>('SECRET_ACCESS_KEY'),
                accessKeyId: this.configService.get<string>('ACCESS_KEY_ID')
            }
        })
    }

    async uploadFile(file: Express.Multer.File, key: string) {
        console.log("inside upload file")
        const bucket = this.configService.get<string>('S3_BUCKET')
        const expiresIn = this.configService.get<number>('EXPIRES_IN')
        const input: PutObjectCommandInput = {
            Body: file.buffer,
            Bucket: bucket,
            Key: key,
            ContentType: file.mimetype
        };
        console.log("input", input)
        try {
            const response: PutObjectCommandOutput = await this.s3.send(
                new PutObjectCommand(input),
            );
            console.log("response", response)
            if (response.$metadata.httpStatusCode === 200) {
                const client = this.s3;
                const command = new GetObjectCommand({ Bucket: bucket, Key: key });
                return getSignedUrl(client, command, { expiresIn: expiresIn });
            }
            throw new Error('File not saved to s3!')
        } catch (err) {
            console.log("uploadFile err", err)
        }
    }

    async getFileUrl(key: string) {
        console.log("inside getFileUrl")
        const bucket = this.configService.get<string>('S3_BUCKET')
        const expiresIn = this.configService.get<number>('EXPIRES_IN')
        
        try {
            const client = this.s3;
            const command = new GetObjectCommand({ Bucket: bucket, Key: key });
            return getSignedUrl(client, command, { expiresIn: expiresIn });
            
        } catch (err) {
            console.log("getFileUrl err", err)
        }
    }
}
