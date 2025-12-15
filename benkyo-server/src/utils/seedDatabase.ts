import fs from 'fs-extra';
import path from 'path';
import { Types } from 'mongoose';
import {
    User,
    Card,
    Conversation,
    Class,
    Deck,
    Document,
    Mooc,
    Package,
    QuizAttempt,
    Quiz,
    Revlog,
    Transaction,
    UserDeckState,
    DeckRating
} from '~/schemas';

function convertOidToString(oid: any): string {
    if (typeof oid === 'string') {
        return oid;
    }
    if (oid && typeof oid === 'object' && '$oid' in oid) {
        return oid.$oid;
    }
    return oid?.toString() || '';
}

function transformDocument(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'object' && '$date' in obj && typeof obj.$date === 'string') {
        return new Date(obj.$date);
    }

    if (typeof obj === 'object' && '$oid' in obj && typeof obj.$oid === 'string') {
        return new Types.ObjectId(obj.$oid);
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => transformDocument(item));
    }

    if (typeof obj === 'object') {
        const transformed: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                transformed[key] = transformDocument(obj[key]);
            }
        }
        return transformed;
    }

    return obj;
}

interface MockDataFile {
    name: string;
    model: any;
}

const mockDataFiles: MockDataFile[] = [
    { name: 'benkyo.users.json', model: User },
    { name: 'benkyo.decks.json', model: Deck },
    { name: 'benkyo.cards.json', model: Card },
    { name: 'benkyo.revlogs.json', model: Revlog },
    { name: 'benkyo.userdeckstates.json', model: UserDeckState },
    { name: 'benkyo.quizzes.json', model: Quiz },
    { name: 'benkyo.quizattempts.json', model: QuizAttempt },
    { name: 'benkyo.classes.json', model: Class },
    { name: 'benkyo.documents.json', model: Document },
    { name: 'benkyo.chats.json', model: Conversation },
    { name: 'benkyo.moocs.json', model: Mooc },
    { name: 'benkyo.packages.json', model: Package },
    { name: 'benkyo.transactions.json', model: Transaction },
    { name: 'benkyo.deckratings.json', model: DeckRating }
];

export async function seedDatabase() {
    try {
        console.log('Starting to seed database with mock data...');

        const mockDataDir = path.join(process.cwd(), 'mockdata');

        for (const { name, model } of mockDataFiles) {
            const filePath = path.join(mockDataDir, name);

            // Check if file exists
            if (!(await fs.pathExists(filePath))) {
                console.log(`[WARNING] File not found: ${name}, skipping...`);
                continue;
            }

            try {
                const data = await fs.readJson(filePath);

                if (Array.isArray(data)) {
                    const docsToInsert = [];
                    for (const doc of data) {
                        const docId = convertOidToString(doc._id);
                        const exists = await model.findById(docId);
                        if (!exists) {
                            docsToInsert.push(transformDocument(doc));
                        }
                    }

                    if (docsToInsert.length > 0) {
                        await model.insertMany(docsToInsert);
                        console.log(
                            `[OK] Seeded ${model.modelName} with ${docsToInsert.length} documents (${data.length - docsToInsert.length} already exist)`
                        );
                    } else {
                        console.log(`[SKIP] ${model.modelName} - all documents already exist`);
                    }
                } else {
                    const docId = convertOidToString(data._id);
                    const exists = await model.findById(docId);
                    if (!exists) {
                        await model.create(transformDocument(data));
                        console.log(`[OK] Seeded ${model.modelName}`);
                    } else {
                        console.log(`[SKIP] ${model.modelName} - document already exists`);
                    }
                }
            } catch (error) {
                console.error(`[ERROR] Error seeding ${model.modelName} from ${name}:`, error);
            }
        }

        console.log('[OK] Database seeding completed!');
    } catch (error) {
        console.error('[ERROR] Error during database seeding:', error);
    }
}
