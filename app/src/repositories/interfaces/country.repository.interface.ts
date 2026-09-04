import Country, { CountryCreationAttributes } from "../../models/country.model";

/**
 * Contrato del Repositorio de Países
 * -----------------------------------
 * Define las operaciones de persistencia disponibles para la entidad Country.
 *
 * Cualquier implementación deberá cumplir esta interfaz.
 */

export interface ICountryRepository {

    /**
     * Obtiene todos los países.
     */
    findAll(): Promise<Country[]>;

}

