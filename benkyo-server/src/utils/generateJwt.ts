import { sign } from 'jsonwebtoken';
import { Types } from 'mongoose';

export function generateToken(_id: Types.ObjectId) {
    return sign(
        {
            id: _id
        },
        process.env.JWT_SECRET!,
        { expiresIn: '48h' }
    );
}
