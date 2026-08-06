import Department from "../models/departament.model";
import repository from "../repositories/department.repository";


class DepartmentService {

    async findDepartments(): Promise<Department[]> {

        return await repository.findDeparments();

    }

}

export default new DepartmentService();