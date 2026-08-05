import Department, { DepartmentCreationAttributes } from "../../models/departament.model";

/**
 * Contrato del Repositorio de Departamentos
 * -----------------------------------
 * Define las operaciones de persistencia disponibles para la entidad Department.
 *
 * Cualquier implementación deberá cumplir esta interfaz.
 */

export interface IDepartmentRepository {

    /**
     * Obtiene todos los departamentos.
     */
    findAll(): Promise<Department[]>;

}
