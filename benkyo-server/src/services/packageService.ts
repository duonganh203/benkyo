import { z } from 'zod';
import { Package } from '~/schemas';
import { createPackageValidation, updatePackageValidation } from '~/validations/packageValidation';
import { NotFoundException } from '~/exceptions/notFound';
import { BadRequestsException } from '~/exceptions/badRequests';
import { ErrorCode } from '~/exceptions/root';

import { startOfQuarter, endOfQuarter } from 'date-fns';

export const createPackageService = async (data: z.infer<typeof createPackageValidation>) => {
    const pkg = await Package.create(data);
    return {
        message: 'Package created successfully',
        id: pkg._id
    };
};

// READ ALL
export const listPackagesService = async () => {
    const packages = await Package.find();
    return packages.map((pkg) => ({
        id: pkg._id,
        name: pkg.name,
        type: pkg.type,
        duration: pkg.duration,
        price: pkg.price,
        features: pkg.features,
        isActive: pkg.isActive,
        createdAt: pkg.createdAt
    }));
};

export const updatePackageService = async (packageId: string, data: z.infer<typeof updatePackageValidation>) => {
    const updated = await Package.findByIdAndUpdate(packageId, data, { new: true });
    if (!updated) {
        throw new NotFoundException('Package not found', ErrorCode.NOT_FOUND);
    }
    return {
        id: updated._id,
        name: updated.name,
        type: updated.type,
        duration: updated.duration,
        price: updated.price,
        features: updated.features,
        isActive: updated.isActive,
        updatedAt: updated.updatedAt
    };
};

export const deletePackageService = async (packageId: string) => {
    const deleted = await Package.findByIdAndDelete(packageId);
    if (!deleted) {
        throw new NotFoundException('Package not found', ErrorCode.NOT_FOUND);
    }
    return { message: 'Package deleted successfully' };
};
