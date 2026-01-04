import { injectable, inject } from 'tsyringe';
import { User, IUserRepository } from '@meu-app/domain';
import { DomainError } from '@meu-app/domain';
import { UserDTO } from '../../dtos/UserDTO';

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject('IUserRepository')
    private userRepository: IUserRepository
  ) {}

  async execute(input: CreateUserInput): Promise<UserDTO> {
    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new DomainError('Email já está em uso');
    }

    // Criar usuário - apenas 3 parâmetros
    const user = User.create(
      input.name,
      input.email,
      input.password
    );

    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      emailVerified: false, // ✅ ADICIONADO: usuário recém-criado, email não verificado
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}