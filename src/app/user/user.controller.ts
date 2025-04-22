import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, WalletUserDto } from './dto/create-user.dto';
import { Roles } from 'src/auth/guards/role/role.decorator';
import { Role } from 'src/auth/guards/role/role.enum';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from 'src/auth/guards/jwt/auth-guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Public()
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  @ApiQuery({ name: 'email' })
  @ApiQuery({ name: 'phone' })
  @ApiQuery({ name: 'lastname' })
  @ApiQuery({ name: 'firstname' })
  @ApiQuery({ name: 'date' })
  @ApiQuery({ name: 'method' })
  @Get()
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('email') email: string,
    @Query('phone') phone: string,
    @Query('lastname') lastname: string,
    @Query('firstname') firstname: string,
    @Query('date') date: string,
    @Query('method') method: number,
  ) {
    return this.userService.findAll({
      page,
      limit,
      email,
      phone,
      lastname,
      firstname,
      date,
      method,
    });
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  findMe(@Request() { user }) {
    return user;
  }
  @Get('all')
  @Public()
  find(@Request() { user }) {
    return this.userService.all()
  }

  @Post('wallet')
  @ApiBearerAuth('access-token')
  @Roles(Role.Admin)
  async updateUser(@Body() dto: WalletUserDto, @Request() { user }) {
    this.userService.changeWallet(dto, user['id']);
  }
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(id);
  // }

  @Put()
  update(@Body() dto: CreateUserDto, @Request() { user }) {
    return this.userService.updateUser(dto, user['id']);
  }
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
