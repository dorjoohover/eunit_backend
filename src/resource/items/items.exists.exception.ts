import { HttpException, HttpStatus } from "@nestjs/common";

export class ItemsAlreadyExists extends HttpException {
    constructor() {
        super("Items already exists", HttpStatus.BAD_REQUEST)
    }
}


export class ItemsErrorExists extends HttpException {
    constructor() {
        super("Error when creating", HttpStatus.BAD_REQUEST)
    }
}
export class ItemsNotFound extends HttpException {
    constructor() {
        super("Item not found", HttpStatus.NOT_FOUND)
    }
}

