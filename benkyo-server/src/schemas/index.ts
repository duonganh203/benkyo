import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, required: false },
    decks: [{ type: Schema.ObjectId, ref: 'Deck' }]
});
const DeckSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isPublic: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    cardCount: { type: Number, default: 0 }
});

export const User = model('User', UserSchema);
export const Deck = model('Deck', DeckSchema);
