import { Router } from 'express';
import { createPackage, listPackages, updatePackage, deletePackage } from '~/controllers/packageController';

import { errorHandler } from '~/errorHandler';
import adminAuthMiddleware from '~/middlewares/adminAuthMiddleware';

const packageRoutes: Router = Router();
packageRoutes.post('/', [adminAuthMiddleware], errorHandler(createPackage));
packageRoutes.get('/', [adminAuthMiddleware], errorHandler(listPackages));
// packageRoutes.get('/:packageId', errorHandler(getPackageById));
packageRoutes.put('/:packageId', [adminAuthMiddleware], errorHandler(updatePackage));
packageRoutes.delete('/:packageId', [adminAuthMiddleware], errorHandler(deletePackage));
export default packageRoutes;
