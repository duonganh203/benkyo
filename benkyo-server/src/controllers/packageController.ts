import { Request, Response } from 'express';
import {
    createPackageService,
    listPackagesService,
    updatePackageService,
    deletePackageService
} from '~/services/packageService';

import { createPackageValidation, updatePackageValidation } from '~/validations/packageValidation';

// CREATE a new package
export const createPackage = async (req: Request, res: Response) => {
    const data = createPackageValidation.parse(req.body);
    const result = await createPackageService(data);
    res.status(201).json(result);
};

// GET all packages
export const listPackages = async (req: Request, res: Response) => {
    const result = await listPackagesService();
    res.json(result);
};

// // GET package by ID
// export const getPackageById = async (req: Request, res: Response) => {
//   const { packageId } = req.params;
//   const result = await getPackageByIdService(packageId);
//   res.json(result);
// };

// UPDATE package
export const updatePackage = async (req: Request, res: Response) => {
    const { packageId } = req.params;
    const data = updatePackageValidation.parse(req.body);
    const result = await updatePackageService(packageId, data);
    res.json(result);
};

// DELETE package
export const deletePackage = async (req: Request, res: Response) => {
    const { packageId } = req.params;
    const result = await deletePackageService(packageId);
    res.json(result);
};
