import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { EstimateStatus, UserType } from '../../utils/enum';
import { EstimateDto } from './dto/estimate.dto';
import { EstimateService } from './estimate.service';
import { AuthGuard } from '../../guard/auth.guard';
import { Roles } from '../../guard/roles.decorator';

@ApiTags('Estimate')
@Controller('estimate')
export class EstimateController {
  constructor(private readonly service: EstimateService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ description: 'estimate create' })
  @Post()
  createEstimate(@Request() { user }, @Body() dto: EstimateDto) {
    return this.service.createEstimate(dto, user['_id']);
  }

  @Get(':status')
  @ApiParam({ name: 'status' })
  @Roles(UserType.admin)
  async getEstimate(
    @Request() { user },
    @Param('status') status: EstimateStatus,
  ) {
    return this.service.getEstimate(status);
  }
  @Get('update/:status/:id')
  @ApiParam({ name: 'status' })
  @ApiParam({ name: 'id' })
  async updateStatusEstimate(
    @Param('status') status: EstimateStatus,
    @Param('id') id: string,
  ) {
    return this.service.updateStatus(status, id);
  }
  @Get('/')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  async getEstimateUser(@Request() { user }) {
    return this.service.getEstimateUser(user['_id']);
  }

  @Delete(':id')
  @ApiParam({ name: 'id' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  async deleteEstimate(@Request() { user }, @Param('id') id: string) {
    return await this.service.deleteEstimate(id);
  }

  @Get('price/:id/:price')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'price' })
  @UseGuards(AuthGuard)
  @Roles(UserType.admin)
  async updatePrice(
    @Request() { user },
    @Param('id') id: string,
    @Param('price') price: number,
  ) {
    return this.service.updatePrice(id, price);
  }

  @Put('message/:id/:status')
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'status' })
  updateEstimate(
    @Body() body: { message: string },
    @Param('id') id: string,
    @Param('status') status: EstimateStatus,
  ) {
    return this.service.updateEstimate(id, status, body.message);
  }
}
