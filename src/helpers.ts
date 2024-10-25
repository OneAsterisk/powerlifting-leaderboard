export const convertWeight = (weight: number, unit: 'lbs' | 'kg'): number => {
    if (unit === 'kg') {
        return Math.round(weight / 2.205);
    }
    return weight;
};