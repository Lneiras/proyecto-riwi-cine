import DepartmentRepository from "../repositories/departament.repository";


class DepartmentService {

    async getAllDepartments() {

        return await DepartmentRepository.findAll();

    }

    async getDepartmentById(id: number){
        return await DepartmentRepository.findById(id)
    }

}

export default new DepartmentService();