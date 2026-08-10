import DepartmentRepository from "../repositories/departament.repository";
import Department from "../models/departament.model";


class DepartmentService {

    async getAllDepartments() {

        return await DepartmentRepository.findAll();

    }

    async getDepartmentById(id: number){
        return await DepartmentRepository.findById(id)
    }

    async findDepartmentsByCountryId(countryId: number): Promise<Department[]> {
    return await DepartmentRepository.findByCountryId(countryId);

    }

}

export default new DepartmentService();