export const conciseAddress = (address: string, startSlice = 3, endSlice = 3): string => {
  return `${address?.slice(0, startSlice)}...${address?.slice(
    address?.length - endSlice,
    address?.length,
  )}`;
};
