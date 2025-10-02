import { z } from 'zod';
import { PackageType, PackageDuration } from '~/schemas';

export const createPackageValidation = z.object({
    name: z.string().min(1, 'Package name is required'),
    type: z.enum([PackageType.BASIC, PackageType.PRO, PackageType.PREMIUM]),
    duration: z.enum([PackageDuration.THREE_MONTHS, PackageDuration.SIX_MONTHS, PackageDuration.ONE_YEAR]),
    price: z.number().positive('Price must be a positive number'),
    features: z.array(z.string()).optional(),
    isActive: z.boolean().optional()
});

export const updatePackageValidation = createPackageValidation.partial();
