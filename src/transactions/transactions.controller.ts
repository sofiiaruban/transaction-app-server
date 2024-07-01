import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Res,
  UploadedFile,
  UseInterceptors,
  Body,
  Patch,
  Query,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { Response } from 'express';
import * as fastcsv from 'fast-csv';
import { parse } from 'csv-parse/sync';
import { FileInterceptor } from '@nestjs/platform-express';
import { Transaction } from './entities/transaction.entity';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('filtered')
  findAllFiltered(
    @Req() req,
    @Query('type') type: string,
    @Query('status') status: string,
  ) {
    return this.transactionService.findAllFiltered(type, status);
  }

  @Get('pagination')
  findAllWithPagination(
    @Req() req,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
  ) {
    return this.transactionService.findAllWithPagination(+page, +limit);
  }

  @Get('pagination/filtered')
  findAllFilteredWithPagination(
    @Req() req,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
    @Query('type') type: string,
    @Query('status') status: string,
  ) {
    return this.transactionService.findAllFilteredWithPagination(
      +page,
      +limit,
      type,
      status,
    );
  }

  @Get('download')
  async downloadTransactions(
    @Res() res: Response,
    @Req() req,
    @Query('type') type: string,
    @Query('status') status: string,
  ) {
    const transactions = await this.transactionService.findAllFiltered(
      type,
      status,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=transactions.csv',
    );

    const csvStream = fastcsv.format({ headers: true });
    csvStream.pipe(res);

    transactions.forEach((transaction) => {
      csvStream.write(transaction);
    });

    csvStream.end();
  }

  @Get()
  async findAll() {
    return this.transactionService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const records = parse(file.buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
    });
    const transactions: Transaction[] = records.map((record) => ({
      Status: record.Status,
      Type: record.Type,
      ClientName: record.ClientName,
      Amount: record.Amount,
    }));

    await this.transactionService.createMany(transactions);

    return res.json(transactions);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() transaction: UpdateTransactionDto,
  ) {
    return this.transactionService.update(id, transaction);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAll(): Promise<void> {
    await this.transactionService.removeAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.transactionService.remove(id);
    return { message: 'Transaction deleted successfully' };
  }
}
