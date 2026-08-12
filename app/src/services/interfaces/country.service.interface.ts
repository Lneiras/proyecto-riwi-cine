import Country from "../../models/country.model";


export interface ICountryService {

    findCountries(): Promise<Country[]>;

}