import Country from "../models/country.model";


class CountryService {

    async findCountries(): Promise<Country[]> {

        return await Country.findAll();

    }

}

export default new CountryService();