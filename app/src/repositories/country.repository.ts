import Country, {CountryAttributes} from "../models/country.model";
import {Optional} from "sequelize";
    
class CountryRepository {

    async findCountries(): Promise<Country[]> {

        // Aquí deberías implementar la lógica para obtener los países desde la base de datos.

        return await Country.findAll();

    }

    async findCountryById(id: number): Promise<Country | null> {
        return await Country.findByPk(id);
    }    

    async createCountry(countryData: Optional<CountryAttributes, 'id'>): Promise<Country> {
        return await Country.create(countryData);
    }

    async updateCountry(id: number, countryData: Partial<CountryAttributes>): Promise<Country> {
        const country = await this.findCountryById(id);
        if (!country) throw new Error("Country not found");
        return await country.update(countryData);
    }

    async deleteCountry(id: number): Promise<void> {
        const country = await this.findCountryById(id);
        if (!country) throw new Error("Country not found");
        return await country.destroy();
    }
}

export default new CountryRepository();