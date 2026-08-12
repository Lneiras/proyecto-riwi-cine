import Department from "../models/departament.model";


class DepartmentService {

    async findDepartments(): Promise<Department[]> {

        return await Department.findAll();

    }

}

export default new DepartmentService();