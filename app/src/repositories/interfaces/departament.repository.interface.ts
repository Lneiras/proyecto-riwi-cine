import Department, { DepartmentCreationAttributes } from "../../models/departament.model";
import { Optional } from "sequelize"

/**
 * Contrato del Repositorio de Departamentos
 * -----------------------------------
 * Define las operaciones de persistencia disponibles para la entidad Department.
 *
 * Cualquier implementación deberá cumplir esta interfaz.
 */

export interface IDepartmentRepository {

    create(data: Optional<DepartmentCreationAttributes, "id">): Promise<Department>

    findAll(): Promise<Department[]>;

    findById(id:number): Promise<Department | null>;

    update(id: number, data: Partial<DepartmentCreationAttributes>): Promise<Department>;

    delete(id: number): Promise<void>;

}


