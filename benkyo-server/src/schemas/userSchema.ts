import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    quizResultList: [{ type: Schema.Types.ObjectId, ref: 'QuizResult' }]
});

export const User = model('User', UserSchema);
