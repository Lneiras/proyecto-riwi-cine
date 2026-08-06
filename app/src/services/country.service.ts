import Country from "../models/country.model";
import repository from "../repositories/country.repository";


class CountryService {

    async findCountries(): Promise<Country[]> {

        return await repository.findCountries();

    }

}

export default new CountryService();