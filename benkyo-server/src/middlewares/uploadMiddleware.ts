import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

const uploadDir = path.join(process.cwd(), 'uploads');
const documentsDir = path.join(uploadDir, 'documents');

fs.ensureDirSync(uploadDir);
fs.ensureDirSync(documentsDir);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, documentsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed.'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024
    }
});

export const getDocumentPath = (filename: string) => {
    return path.join(documentsDir, filename);
};
