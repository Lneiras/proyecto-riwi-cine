import Department, { DepartmentCreationAttributes } from "../models/departament.model"
import { IDepartmentRepository } from "./interfaces/departament.repository.interface"
import { Optional } from "sequelize"

class DepartmentRepository implements IDepartmentRepository {

    async create(data: Optional<DepartmentCreationAttributes, "id">): Promise<Department> {
        return await Department.create(data);
    };

    async findAll(): Promise<Department[]> {
        return await Department.findAll()
    };

    async findById(id: number): Promise<Department | null> {
        return await Department.findByPk(id);
    };

    async update(id:number, data: Partial<DepartmentCreationAttributes>): Promise<Department> {
        const department = await this.findById(id);
        if (!department) throw new Error("Department not found");
        return await department.update(data);
    }

    async delete(id: number): Promise<void> {
        const department = await this.findById(id)
        if (!department) throw new Error("Department not found")
        await department.destroy()
    }
}

export default new DepartmentRepository()