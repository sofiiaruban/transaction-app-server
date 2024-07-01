import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { TransactionService } from 'src/transactions/transactions.service';

@Injectable()
export class AuthorGuard implements CanActivate {
  constructor(private readonly transactionService: TransactionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { id } = request.params;
    const entity = await this.transactionService.findOne(id);
    const user = request.user;

    if (entity && user && entity.user.id === user.id) {
      return true;
    }

    throw new BadRequestException('Something went wrong...');
  }
}
