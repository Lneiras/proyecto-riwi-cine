import { 
    Showtime, 
    Format, 
    Language, 
    Room, 
    Cinema 
} from "../models";


class FunctionRepository {

    async findFunctionById(id: number): Promise<Showtime | null> {
        return await Showtime.findByPk(id, {
            include: [
                {
                    model: Format
                },
                {
                    model: Language
                },
                {
                    model: Room,
                    include: [Cinema]
                }
            ]
        });
    }
}

export default new FunctionRepository;