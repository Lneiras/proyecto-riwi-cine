

import MembershipCode from "../models/membership-code.model";
import { IMembershipCodeRepository } from "./interfaces/membership-code.repository.interface";

class MembershipCodeRepository implements IMembershipCodeRepository {
    async findByUserId(userId: number): Promise<MembershipCode | null> {
        return await MembershipCode.findOne({ where: { userId } });
    }

    async create(userId: number, code: string): Promise<MembershipCode> {
        return await MembershipCode.create({ userId, code });
    }
}

export default new MembershipCodeRepository();