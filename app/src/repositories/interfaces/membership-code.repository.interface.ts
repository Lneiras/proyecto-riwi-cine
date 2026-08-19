// app/src/repositories/interfaces/membership-code.repository.interface.ts

import MembershipCode from "../../models/membership-code.model";

export interface IMembershipCodeRepository {
    findByUserId(userId: number): Promise<MembershipCode | null>;
    create(userId: number, code: string): Promise<MembershipCode>;
}