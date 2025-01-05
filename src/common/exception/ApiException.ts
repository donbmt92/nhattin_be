import { HttpException } from "@nestjs/common";

export class ApiException extends HttpException {
    public code : string;

    constructor(err){
        super(err.messenger, err.status);
        this.code = err.code;
    }
}