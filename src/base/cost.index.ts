const index = {
  2024: 1.0,
  2023: 1.05,
  2022: 1.1,
  2021: 1.44,
  2020: 1.96,
  2019: 2.11,
  2018: 2.14,
  2017: 2.42,
  2016: 2.54,
};
const apartment = {
  2017: 106.4,
  2018: 115.0,
  2019: 102.5,
  2020: 114.8,
  2021: 139.1,
  2022: 133.3,
  2023: 103.8,
  2024: 108.7,
};

const engineer = {
  2017: 104.6,
  2018: 105.4,
  2019: 102.3,
  2020: 100.8,
  2021: 121.0,
  2022: 116.2,
  2023: 99.5,
  2024: 106.3,
};

const general = {
  2017: 105.2,
  2018: 113.0,
  2019: 101.5,
  2020: 107.3,
  2021: 136.7,
  2022: 130.5,
  2023: 104.8,
  2024: 105.1,
};

const common = (year: number) => {
  if (year == 2016) return 100;
  if (year == 2017) return general[2017];

  return (common[year - 1] * general[year]) / 100;
};

const Index = (year: number) => {
  return common[2024] / common[year];
};
const notApartment: Record<number, number> = {
  2017: 104.9,
  2018: 113.0,
  2019: 101.2,
  2020: 105.6,
  2021: 137.0,
  2022: 130.4,
  2023: 105.4,
  2024: 104.0,
};

const NotApartment = (year: number): number => {
  if (year === 2016) return 100; // Base case for 2016
  if (year === 2017) return 105; // Base case for 2017

  // Recursive calculation
  const prevValue = NotApartment(year - 1);
  const growthFactor = notApartment[year];
  if (growthFactor === undefined) {
    throw new Error(`Growth factor for year ${year} is not defined.`);
  }
  return (prevValue * growthFactor) / 100;
};

export const NotApartmentIndex = (year: number): number => {
  if (year === 2024) return 1.0; // Base index for 2024

  const baseYearValue = NotApartment(2024);
  const targetYearValue = NotApartment(year);

  return baseYearValue / targetYearValue;
};
