export const shortName = (str: string, length: number): string => {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
};

export const formatHeight = (heightCm: number, country: string = "VN") => {
  if (!heightCm) return "";

  // US
  if (country === "US") {
    const totalInches = heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }

  // default (VN, EU)
  return `${heightCm} cm`;
};

export const formatWeight = (weightKg: number, country: string = "VN") => {
  if (!weightKg) return "";

  if (country === "US") {
    const lbs = weightKg * 2.20462;
    return `${Math.round(lbs)} lb`;
  }

  return `${weightKg} kg`;
};
