import User from "../../models/user.model";
import { CreateUserDto } from "../../dto/create-user.dto";


export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService {
  /**
   * Registra un nuevo usuario.
   */
  register(data: CreateUserDto): Promise<User>;


  /**
   * Renueva el token de acceso.
   */
  refresh(refreshToken: string): Promise<AuthResult>;
}
