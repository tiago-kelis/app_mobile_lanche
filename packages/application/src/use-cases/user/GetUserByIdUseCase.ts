import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '@meu-app/domain';
import { DomainError } from '@meu-app/domain';
import { UserDTO } from '../../dtos/UserDTO';

interface GetUserByIdInput {
  userId: string;
  requestedBy: string;
}

@injectable()
export class GetUserByIdUseCase {
  constructor(
    @inject('IUserRepository')
    private userRepository: IUserRepository
  ) {}

  async execute(input: GetUserByIdInput): Promise<UserDTO> {
    const user = await this.userRepository.findById(input.userId);
    
    if (!user) {
      throw new DomainError('Usuário não encontrado');
    }

    // Verificar permissão: só pode ver próprios dados ou admin pode ver todos
    const requestingUser = await this.userRepository.findById(input.requestedBy);
    if (!requestingUser) {
      throw new DomainError('Usuário solicitante não encontrado');
    }

    const isSelf = input.userId === input.requestedBy;
    const isAdmin = requestingUser.canManageOrders();

    if (!isSelf && !isAdmin) {
      throw new DomainError('Sem permissão para ver dados deste usuário');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      emailVerified: false, // ✅ CORRIGIDO: valor padrão até User ter essa propriedade
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}