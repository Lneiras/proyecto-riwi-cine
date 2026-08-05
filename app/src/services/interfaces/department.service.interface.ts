import Department from "../../models/departament.model";


export interface IDepartmentService {

    findDepartments(): Promise<Department[]>;

}