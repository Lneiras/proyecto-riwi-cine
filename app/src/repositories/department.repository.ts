import Department from "../models/departament.model";


class DepartmentRepository {

    async findDeparments(): Promise<Department[]> {
        return await Department.findAll();
}}


export default new DepartmentRepository();