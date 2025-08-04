export const toISODate = (v: Date | string | number) => new Date(v).toISOString().split('T')[0];
