import { InferSchemaType, Schema, Types, model } from 'mongoose';

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
enum PublicStatus {
    PRIVATE = 0,
    PENDING = 1,
    APPROVED = 2,
    REJECTED = 3
}

enum PackageType {
    BASIC = 'Basic',
    PRO = 'Pro',
    PREMIUM = 'Premium'
}

enum PackageDuration {
    THREE_MONTHS = '3M',
    SIX_MONTHS = '6M',
    ONE_YEAR = '1Y'
}
enum ProgressState {
    NOT_STARTED = 0,
    IN_PROGRESS = 1,
    COMPLETED = 2
}

const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    avatar: { type: String },
    isPro: { type: Boolean, default: false },
    proExpiryDate: { type: Date, default: null, required: false },
    proType: { type: String, enum: Object.values(PackageType), default: PackageType.BASIC },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    fsrsParams: {
        request_retention: { type: Number, default: 0.9 },
        maximum_interval: { type: Number, default: 36500 },
        w: {
            type: [Number],
            default: [
                0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395,
                0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621
            ]
        },
        enable_fuzz: { type: Boolean, default: false },
        enable_short_term: { type: Boolean, default: true },
        card_limit: { type: Number, default: 20 },
        lapses: { type: Number, default: 8 }
    },
    decks: [{ type: Schema.Types.ObjectId, ref: 'Deck' }],
    stats: {
        totalReviews: { type: Number, default: 0 },
        studyStreak: { type: Number, default: 0 },
        longestStudyStreak: { type: Number, default: 0 },
        lastStudyDate: { type: Date }
    }
});

const DeckSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isPublic: { type: Boolean, default: false },
    publicStatus: {
        type: Number,
        default: PublicStatus.PRIVATE
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    cardCount: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String },
    fsrsParams: {
        request_retention: { type: Number },
        maximum_interval: { type: Number },
        w: { type: [Number] },
        enable_fuzz: { type: Boolean },
        enable_short_term: { type: Boolean },
        card_limit: { type: Number },
        lapses: { type: Number }
    }
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
    mooc: { type: Schema.Types.ObjectId, ref: 'Mooc', required: false },
    moocDeck: { type: Schema.Types.ObjectId, ref: 'Deck', required: false },
    deck: { type: Schema.Types.ObjectId, ref: 'Deck', required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    type: { type: String, enum: ['manual', 'ai'], default: 'manual', required: false },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: false },
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

const DocumentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['pdf', 'doc', 'docx'] },
    embeddingId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

const ConversationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    question: { type: String, required: true },
    response: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
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

const TransactionSchema = new Schema(
    {
        tid: { type: String },
        amount: { type: Number },
        when: { type: Date },
        bank_sub_acc_id: { type: String },
        subAccId: { type: String },
        bankName: { type: String },
        bankAbbreviation: { type: String },
        corresponsiveAccount: { type: String },
        isPaid: { type: Boolean, default: false, required: true },
        expiredAt: { type: Date, required: true, default: () => new Date(Date.now() + 30 * 60 * 1000) },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        package: { type: Schema.Types.ObjectId, ref: 'Package', required: true }
    },
    { timestamps: true }
);

const PackageSchema = new Schema(
    {
        name: { type: String, required: true },
        type: { type: String, enum: Object.values(PackageType), required: true },
        duration: { type: String, enum: Object.values(PackageDuration), required: true },
        price: { type: Number, required: true },
        features: [{ type: String }],
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const ClassSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        bannerUrl: { type: String, required: false },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        visibility: { type: String, enum: ['public', 'private'], default: 'private' },
        requiredApprovalToJoin: { type: Boolean, default: false },
        invitedUsers: [
            {
                user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
                invitedAt: { type: Date, default: Date.now }
            }
        ],
        visited: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
                lastVisit: { type: Date, default: Date.now }
            }
        ],
        joinRequests: [
            {
                user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
                requestDate: { type: Date, default: Date.now }
            }
        ],
        users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        decks: [
            {
                deck: { type: Schema.Types.ObjectId, ref: 'Deck', required: true },
                description: { type: String },
                startTime: { type: Date },
                endTime: { type: Date }
            }
        ],
        userClassStates: [{ type: Schema.Types.ObjectId, ref: 'UserClassState' }]
    },
    { timestamps: true }
);

const UserClassStateSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
        deck: { type: Schema.Types.ObjectId, ref: 'Deck', required: true },
        completedCardIds: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
        correctCount: { type: Number, default: 0 },
        totalCount: { type: Number, default: 0 },
        startTime: { type: Date, default: Date.now },
        endTime: { type: Date },
        duration: { type: Number }
    },
    { timestamps: true }
);
const MoocSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    owner: { type: Types.ObjectId, ref: 'User', required: true },
    class: { type: Types.ObjectId, ref: 'Class', required: false },
    decks: [
        {
            deck: { type: Types.ObjectId, ref: 'Deck', required: true },
            order: { type: Number, required: true }
        }
    ],

    enrolledUsers: [
        {
            user: { type: Types.ObjectId, ref: 'User', required: true },
            currentDeckIndex: { type: Number, default: 0 },
            progressState: {
                type: Number,
                enum: ProgressState,
                default: ProgressState.NOT_STARTED
            },
            deckProgress: [
                {
                    deck: { type: Types.ObjectId, ref: 'Deck', required: true },
                    completed: { type: Boolean, default: false },
                    completedAt: { type: Date }
                }
            ],
            startedAt: { type: Date },
            completedAt: { type: Date }
        }
    ],

    publicStatus: {
        type: Number,
        enum: PublicStatus,
        default: PublicStatus.PRIVATE
    },

    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'VND' },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export const Class = model('Class', ClassSchema);
export const UserClassState = model('UserClassState', UserClassStateSchema);
export const User = model('User', UserSchema);
export const Deck = model('Deck', DeckSchema);
export const Card = model('Card', CardSchema);
export const Revlog = model('Revlog', RevlogSchema);
export const UserDeckState = model('UserDeckState', UserDeckStateSchema);
export const Quiz = model('Quiz', QuizSchema);
export const QuizAttempt = model('QuizAttempt', QuizAttemptSchema);
export const DeckRating = model('DeckRating', DeckRatingSchema);
export const Document = model('Document', DocumentSchema);
export const Conversation = model('Chat', ConversationSchema);
export const StudySession = model('StudySession', StudySessionSchema);
export const Transaction = model('Transaction', TransactionSchema);
export const Package = model('Package', PackageSchema);
export const Mooc = model<Mooc>('Mooc', MoocSchema);
export type Mooc = InferSchemaType<typeof MoocSchema>;
export type TransactionType = InferSchemaType<typeof TransactionSchema>;
export type ConversationType = InferSchemaType<typeof ConversationSchema>;
export type ClassStateType = InferSchemaType<typeof ClassSchema>;
export type UserClassStateType = InferSchemaType<typeof UserClassStateSchema>;
export { Rating, State, PublicStatus, PackageType, PackageDuration };
