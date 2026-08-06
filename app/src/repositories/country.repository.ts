import Country from "../models/country.model";

    
class CountryRepository {

    async findCountries(): Promise<Country[]> {

        // Aquí deberías implementar la lógica para obtener los países desde la base de datos.

        return await Country.findAll();

    }
}

export default new CountryRepository();