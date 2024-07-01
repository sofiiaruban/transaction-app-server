import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  private buildWhereCondition(type: string, status: string) {
    let whereCondition = {};

    if (type && status) {
      whereCondition = {
        Status: status,
        Type: type,
      };
    } else if (type) {
      whereCondition = {
        Type: type,
      };
    } else if (status) {
      whereCondition = {
        Status: status,
      };
    }

    return whereCondition;
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find();
  }

  async findOne(id: number): Promise<Transaction> {
    return this.transactionRepository.findOneBy({ id });
  }

  async create(transaction: Transaction): Promise<Transaction> {
    return this.transactionRepository.save(transaction);
  }
  async removeAll(): Promise<void> {
    await this.transactionRepository.clear();
  }

  async createMany(transactions: Transaction[]): Promise<Transaction[]> {
    return this.transactionRepository.save(transactions);
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (!transaction) throw new NotFoundException('Transaction not found');
    await this.transactionRepository.update(id, updateTransactionDto);
    const updatedTransaction = await this.findOne(id);

    return await this.create(updatedTransaction);
  }

  async remove(id: number): Promise<void> {
    await this.transactionRepository.delete(id);
  }

  async findAllWithPagination(page: number, limit: number) {
    return await this.transactionRepository.find({
      take: limit,
      skip: page * limit,
    });
  }

  async findAllFilteredWithPagination(
    page: number,
    limit: number,
    type: string,
    status: string,
  ) {
    const whereCondition = this.buildWhereCondition(type, status);

    return await this.transactionRepository.find({
      where: whereCondition,
      take: limit,
      skip: page * limit,
      order: {
        id: 'ASC',
      },
    });
  }

  async findAllFiltered(type: string, status: string) {
    const whereCondition = this.buildWhereCondition(type, status);

    return await this.transactionRepository.find({
      where: whereCondition,
      order: {
        id: 'ASC',
      },
    });
  }
}
