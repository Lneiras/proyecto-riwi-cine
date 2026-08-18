import { Showtime } from "../models";
import repository from "../repositories/function.repository"



class FunctionService {
    async getFunctionById(id: number): Promise<Showtime> {
        const showtime = await repository.findFunctionById(id);
        if (!showtime) {
            throw new Error("Showtime not found");
        };
        const started = new Date(showtime.dateTime).getTime() <= Date.now();
        if (started) {
            throw new Error("Function already started")
        }
        return showtime
    }

    async getFunctionPrice(id: number) {
        const showtime = await this.getFunctionById(id);
        if (!showtime) {
            throw new Error("Showtime not found");
        };

        let finalPrice = Number(showtime.basePrice);

        const format = (showtime as any).format?.name?.toUpperCase();

        if (format === "3D") finalPrice += 5000
        if (format === "4DX") finalPrice += 10000
        if (format === "IMAX") finalPrice += 15000

        const roomName = (showtime as any).room?.name?.toUpperCase() || "";
        if (roomName.includes("VIP")) {
            finalPrice += 8000;
        }

        const hour = new Date(showtime.dateTime).getHours();
        if (hour >= 18) {
            finalPrice += 3000;
        }

        return {
            id: id,
            basePrice: showtime.basePrice,
            finalPrice
        }
    }
}


export default new FunctionService