import { HttpException } from "@nestjs/common";

export class ApiException extends HttpException {
    public code : string;

    constructor(err){
        super(err.message || err.messenge, err.status);
        this.code = err.code;
    }
}