import { model, Schema } from 'mongoose';

const DeckSchema = new Schema({
    userId: { type: Schema.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isPublic: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    cardCount: { type: Number, default: 0 }
});

export const Deck = model('Deck', DeckSchema);
