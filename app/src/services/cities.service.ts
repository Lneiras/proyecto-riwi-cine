import CityRepository from "../repositories/cities.repository";

class CityService {
    async getAllCities() {
        return await CityRepository.findAll();
    }

    async getCityById(id: number) {
        return await CityRepository.findById(id);
    }
    // Quedan pendientes las otras funciones de crear, actualizar y eliminar ciudades, que se pueden implementar de manera similar a las funciones anteriores.
    //que estan en repositories/cities.repository.ts para utilizar en el service y luego en el controller
    //pero se hará cuando se cree el perfil de admin y tengamos verifytoken y requirerole en la carpeta de middlewares 
}

export default new CityService();