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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, WalletUserDto } from './dto/create-user.dto';
import { Roles } from 'src/auth/guards/role/role.decorator';
import { Role } from 'src/auth/guards/role/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/auth/guards/jwt/auth-guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Public()
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  findMe(@Request() { user }) {
    return user;
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
