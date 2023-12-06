const planSelection = [
  {
    planId: "ICIC100",
    planPrice: [
      { ageBand: "18-35", price: 210 },
      { ageBand: "36-45", price: 260 },
      { ageBand: "46-55", price: 415 },
      { ageBand: "56-60", price: 605 },
      { ageBand: "61-65", price: 865 },
    ],
  },
  {
    planId: "BAJAJ200",
    planPrice: [
      { ageBand: "18-35", price: 123 },
      { ageBand: "36-45", price: 300 },
      { ageBand: "45-55", price: 360 },
      { ageBand: "56-60", price: 600 },
      { ageBand: "61-65", price: 755 },
    ],
  },
];
const plan = [
  {
    planId: "ICIC100",
    planName: "ICICI",
    planStatus: "ACTIVE",
    planDesc: "ICICI desc",
    notCovered:  ["DEATH"],
    covered:['xyz'],
    planPrice: [
      {
        ageBand: "18-35",
        monthlyPrice: 210,
        quarterlyPrice: 840,
        halfYearlyPrice: 1260,
        annuallyPrice: 2520,
      },
      {
        ageBand: "35-45",
        monthlyPrice: 300,
        quarterlyPrice: 1200,
        halfYearlyPrice: 1800,
        annuallyPrice: 3600,
      },
      {
        ageBand: "45-55",
        monthlyPrice: 400,
        quarterlyPrice: 1600,
        halfYearlyPrice: 2400,
        annuallyPrice: 4800,
      },
      {
        ageBand: "55-60",
        monthlyPrice: 450,
        quarterlyPrice: 1800,
        halfYearlyPrice: 2700,
        annuallyPrice: 12,
      },
      {
        ageBand: "60-65",
        monthlyPrice: 500,
        quarterlyPrice: 2000,
        halfYearlyPrice: 3000,
        annuallyPrice: 6000,
      },
    ],
  },
  {
    planId: "BAJAJ200",
    planName: "BAJAJ",
    planDesc: "BAJAJ desc",
    notCovered:[ "LIFE"],
    covered:['xyz'],
    planPrice: [
      {
        ageBand: "18-35",
        monthlyPrice: 150,
        quarterlyPrice: 600,
        halfYearlyPrice: 900,
        annuallyPrice: 1800,
      },
      {
        ageBand: "35-45",
        monthlyPrice: 250,
        quarterlyPrice: 1000,
        halfYearlyPrice: 1500,
        annuallyPrice: 3000,
      },
      {
        ageBand: "45-55",
        monthlyPrice: 320,
        quarterlyPrice: 1280,
        halfYearlyPrice: 1920,
        annuallyPrice: 3840,
      },
      {
        ageBand: "55-60",
        monthlyPrice: 405,
        quarterlyPrice: 1620,
        halfYearlyPrice: 2430,
        annuallyPrice: 4860,
      },
      {
        ageBand: "60-65",
        monthlyPrice: 506,
        quarterlyPrice: 2024,
        halfYearlyPrice: 3036,
        annuallyPrice: 6072,
      },
    ],
  },
];
module.exports = { planSelection, plan };
