import CityRepository from "../repositories/cities.repository";

class CityService {
    async getAllCities() {
        return await CityRepository.findAll();
    }

    async getCityById(id: number) {
        return await CityRepository.findById(id);
    }
}

export default new CityService();