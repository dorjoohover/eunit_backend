import { HttpException, HttpStatus } from "@nestjs/common";

export class AdAlreadyExists extends HttpException {
    constructor() {
        super("Ad already exists", HttpStatus.BAD_REQUEST)
    }
}


export class AdWrongExists extends HttpException {
    constructor() {
        super("Wrong params", HttpStatus.BAD_REQUEST)
    }
}
export class AdNotFound extends HttpException {
    constructor() {
        super("Ad not found", HttpStatus.NOT_FOUND)
    }
}

export class NotEnoughEunit extends HttpException {
    constructor() {
        super("Not enough Eunit point", HttpStatus.BAD_REQUEST)
    }
}
