import Country from "../models/country.model";


class CountryService {

    async findCountries(): Promise<Country[]> {

        return await Country.findAll();

    }

    async findCountryById(id: number): Promise<Country | null> {
        return await Country.findByPk(id);
    }

}

export default new CountryService();