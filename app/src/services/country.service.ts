import Country from "../models/country.model";
import repository from "../repositories/country.repository";


class CountryService {

    async findCountries(): Promise<Country[]> {

        return await repository.findCountries();

    }

    async findCountryById(id: number): Promise<Country | null> {
        return await Country.findByPk(id);
    }

}

export default new CountryService();