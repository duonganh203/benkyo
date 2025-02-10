import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const personSchema = new Schema({
    name: String
});

const storySchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Person' },
    title: String
});

export const Story = model('Story', storySchema);
export const Person = model('Person', personSchema);

export const User = model('User', UserSchema);
