import User, { UserCreationAttributes } from "../../models/user.model";


export interface IAuthRepository {
  /**
   * Crea un usuario.
   */
  create(data: UserCreationAttributes): Promise<User>;

  



}