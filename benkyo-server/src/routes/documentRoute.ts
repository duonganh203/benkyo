import { Router } from 'express';
import { uploadDocument, getUserDocuments, getDocumentById, deleteDocument } from '~/controllers/documentController';
import { errorHandler } from '~/errorHandler';
import authMiddleware from '~/middlewares/authMiddleware';
import { upload } from '~/middlewares/uploadMiddleware';

const documentRoutes: Router = Router();

documentRoutes.post('/upload', [authMiddleware, upload.single('document')], errorHandler(uploadDocument));
documentRoutes.get('/', [authMiddleware], errorHandler(getUserDocuments));
documentRoutes.get('/:id', [authMiddleware], errorHandler(getDocumentById));
documentRoutes.delete('/:id', [authMiddleware], errorHandler(deleteDocument));

export default documentRoutes;
