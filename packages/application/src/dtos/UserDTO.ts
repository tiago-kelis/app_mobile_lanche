export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  active?: boolean;
}

export interface UserProfileDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
  // Não expõe campos sensíveis como password
}