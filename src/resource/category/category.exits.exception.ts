import { HttpException, HttpStatus } from "@nestjs/common";

export class CategoryAlreadyExists extends HttpException {
    constructor() {
        super("Category already exists", HttpStatus.BAD_REQUEST)
    }
}


export class CategoryWrongExists extends HttpException {
    constructor() {
        super("Wrong params", HttpStatus.BAD_REQUEST)
    }
}
export class CategoryNotFound extends HttpException {
    constructor() {
        super("Category not found", HttpStatus.NOT_FOUND)
    }
}

