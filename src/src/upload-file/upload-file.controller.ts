import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileService } from './upload-file.service';

@Controller('uploadFile')
export class UploadFileController {

    constructor(private readonly uploadFileService: UploadFileService) {}

    @Post('/:id/upload-file')
    @UseInterceptors(FileInterceptor('file'))
    async addFile(
        @UploadedFile() file: Express.Multer.File,
        //@Param('id', new ParseUUIDPipe()) id: string,
        @Param('id') id: number,
        @Body('document_type') document_type: string,
        @Res() request: Request,
        @Res() response: Response,
    ) {
        console.log("upload-file", file)
        console.log("document_type", document_type)
        await this.uploadFileService.addFile(file, id, document_type, response)
    }

    @Get('/:id/get-file')
    @UseInterceptors(FileInterceptor('file'))
    async getFileUrl(
        //@UploadedFile() file: Express.Multer.File,
        @Param('id') id: string,
        @Res() request: Request,
        @Res() response: Response,
    ) {
        console.log("get-file id", id)
        await this.uploadFileService.getFile(id, response)
    }
}
