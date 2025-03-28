import { Schema, model } from 'mongoose';

enum Rating {
    AGAIN = 1,
    HARD = 2,
    GOOD = 3,
    EASY = 4
}

enum State {
    NEW = 0,
    LEARNING = 1,
    REVIEW = 2,
    RELEARNING = 3
}

const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    avatar: { type: String },
    fsrsParams: {
        request_retention: { type: Number, default: 0.9 },
        maximum_interval: { type: Number, default: 36500 },
        w: {
            type: [Number],
            default: [0.4, 0.6, 2.4, 5.8, 4.93, 9.93, 5.8, 19.25, 1.64, 1.01, 1.55, 0.1, 3.0, 0.9]
        },
        enable_fuzz: { type: Boolean, default: false },
        enable_short_term: { type: Boolean, default: true },
        card_limit: { type: Number, default: 50 },
        lapses: { type: Number, default: 8 }
    },
    decks: [{ type: Schema.Types.ObjectId, ref: 'Deck' }],
    stats: {
        totalReviews: { type: Number, default: 0 },
        studyStreak: { type: Number, default: 0 },
        lastStudyDate: { type: Date }
    }
});

const DeckSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isPublic: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    cardCount: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 }
});

const CardSchema = new Schema({
    deck: { type: Schema.Types.ObjectId, ref: 'Deck', required: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    media: [
        {
            type: { type: String, enum: ['image', 'audio', 'video'] },
            url: { type: String },
            filename: { type: String }
        }
    ]
});

const RevlogSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    card: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
    grade: { type: Number, required: true },
    state: { type: Number, required: true },
    due: { type: Date, default: Date.now },
    stability: { type: Number, required: true },
    difficulty: { type: Number, required: true },
    elapsed_days: { type: Number, required: true },
    last_elapsed_days: { type: Number, required: true },
    scheduled_days: { type: Number, required: true },
    review: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const UserDeckStateSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deck: { type: Schema.Types.ObjectId, ref: 'Deck', required: true },
    isOriginalOwner: { type: Boolean, default: false },
    newCardsPerDay: { type: Number, default: 20 },
    reviewsPerDay: { type: Number, default: 100 },
    lastStudied: { type: Date },
    createdAt: { type: Date, default: Date.now },
    stats: {
        streak: { type: Number, default: 0 },
        totalCards: { type: Number, default: 0 },
        newCards: { type: Number, default: 0 },
        learningCards: { type: Number, default: 0 },
        reviewCards: { type: Number, default: 0 }
    }
});
const QuizSchema = new Schema({
    deck: { type: Schema.Types.ObjectId, ref: 'Deck', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    questions: [
        {
            questionText: { type: String, required: true },
            choices: [
                {
                    text: { type: String, required: true }
                }
            ],
            correctAnswer: { type: Number, required: true }
        }
    ]
});

const QuizAttemptSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, default: 0 },
    responses: [
        {
            questionIndex: { type: Number, required: true },
            selectedChoice: { type: Number, required: true }
        }
    ]
});

const DeckRatingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deck: { type: Schema.Types.ObjectId, ref: 'Deck', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const StudySessionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deck: { type: Schema.Types.ObjectId, ref: 'Deck', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number },
    cardsReviewed: { type: Number, default: 0 },
    cardsCorrect: { type: Number, default: 0 },
    avgResponseTime: { type: Number },
    deviceInfo: { type: String }
});

export const User = model('User', UserSchema);
export const Deck = model('Deck', DeckSchema);
export const Card = model('Card', CardSchema);
export const Revlog = model('Revlog', RevlogSchema);
export const UserDeckState = model('UserDeckState', UserDeckStateSchema);
export const Quiz = model('Quiz', QuizSchema);
export const QuizAttempt = model('QuizAttempt', QuizAttemptSchema);
export const DeckRating = model('DeckRating', DeckRatingSchema);
export const StudySession = model('StudySession', StudySessionSchema);
export { Rating, State };
