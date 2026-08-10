import City, {CityAttributes} from "../models/cities.model";
import {Optional} from "sequelize";


class CityRepository {
    async findAll(): Promise<City[]> {
        return await City.findAll();
    }

    async findById(id: number): Promise<City | null> {
        return await City.findByPk(id);
    }

    async create(cityData: Optional<CityAttributes, 'id'>): Promise<City> {
        return await City.create(cityData);
    }

    async update(id: number, cityData: Partial<CityAttributes>): Promise<City> {
        const city = await this.findById(id);
        if (!city) throw new Error("City not found");
        return await city.update(cityData);
    }

    async delete(id: number): Promise<void> {
        const city = await this.findById(id);
        if (!city) throw new Error("City not found");
        return await city.destroy();
    }

    async findByDepartmentId(departmentId: number): Promise<City[]> {
        return await City.findAll({ where: { departmentId } });
    }


}

export default new CityRepository();