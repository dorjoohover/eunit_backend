import { HttpException, HttpStatus } from "@nestjs/common";

export class EstimateAlreadyExists extends HttpException {
    constructor() {
        super("Estimate already exists", HttpStatus.BAD_REQUEST)
    }
}


export class EstimateWrongExists extends HttpException {
    constructor() {
        super("Wrong params", HttpStatus.BAD_REQUEST)
    }
}
export class EstimateNotFound extends HttpException {
    constructor() {
        super("Estimate not found", HttpStatus.NOT_FOUND)
    }
}

