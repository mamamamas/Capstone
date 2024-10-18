const inventoryData = [
  {
    productName: "Alaxan FR 200/325mg cap",
    initialQty: 500,
    currentQty: 341,
    oldStockQty: 133,
    oldStockExp: "2025-03-01",
    newStockQty: 208,
    newStockExp: "2027-02-01",
  },
  {
    productName: "Ambroxol HCl RM 30mg tab",
    initialQty: 239,
    currentQty: 239,
    oldStockQty: 239,
    oldStockExp: "2024-08-01",
    newStockQty: 0,
    newStockExp: "-",
  },
  {
    productName: "Amoxicillin Trihydrate RM 500mg cap",
    initialQty: 0,
    currentQty: 0,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 0,
    newStockExp: "-",
  },
  {
    productName: "Antamin 4mg tab",
    initialQty: 5,
    currentQty: 5,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 5,
    newStockExp: "2026-08-01",
  },
  {
    productName: "Asmalin 1mg/ml Soln for inhalation",
    initialQty: 5,
    currentQty: 5,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 5,
    newStockExp: "-",
  },
  {
    productName: "Biogesic 120mg/5ml susp",
    initialQty: 3000,
    currentQty: 3000,
    oldStockQty: 2,
    oldStockExp: "2024-07-01",
    newStockQty: 3000,
    newStockExp: "2025-01-01",
  },
  {
    productName: "Biogesic 250mg/5ml susp",
    initialQty: 500,
    currentQty: 460,
    oldStockQty: 700,
    oldStockExp: "2026-10-01",
    newStockQty: 460,
    newStockExp: "2024-09-01",
  },
  {
    productName: "Biogesic 500mg tab",
    initialQty: 500,
    currentQty: 462,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 462,
    newStockExp: "2027-04-01",
  },
  {
    productName: "Buscopan 10mg tab",
    initialQty: 0,
    currentQty: 0,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 0,
    newStockExp: "-",
  },
  {
    productName: "Buscopan Venus 10/500mg tab",
    initialQty: 500,
    currentQty: 500,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 500,
    newStockExp: "2025-12-01",
  },
  {
    productName: "Calcisaph 500mg tab",
    initialQty: 500,
    currentQty: 479,
    oldStockQty: 77,
    oldStockExp: "2024-10-01",
    newStockQty: 479,
    newStockExp: "2026-01-01",
  },
  {
    productName: "Cinnarizine RM 25mg tab",
    initialQty: 0,
    currentQty: 0,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 0,
    newStockExp: "-",
  },
  {
    productName: "Cloxacillin Na RM 500mg cap",
    initialQty: 1000,
    currentQty: 820,
    oldStockQty: 1,
    oldStockExp: "2025-09-01",
    newStockQty: 820,
    newStockExp: "2026-03-01",
  },
  {
    productName: "Daktarin Oral Gel 20mg",
    initialQty: 500,
    currentQty: 478,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 478,
    newStockExp: "2025-03-01",
  },
  {
    productName: "Decolgen ND 25/500mg cap",
    initialQty: 500,
    currentQty: 484,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 484,
    newStockExp: "2028-04-01",
  },
  {
    productName: "Diatabs 2mg cap",
    initialQty: 0,
    currentQty: 0,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 0,
    newStockExp: "-",
  },
  {
    productName: "Dolfenal 500mg tab",
    initialQty: 100,
    currentQty: 99,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 99,
    newStockExp: "2027-12-01",
  },
  {
    productName: "Domperidone RM 10mg tab",
    initialQty: 30,
    currentQty: 30,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 30,
    newStockExp: "2026-01-01",
  },
  {
    productName: "Gastrifar 10mg tab",
    initialQty: 20,
    currentQty: 15,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 15,
    newStockExp: "2026-02-01",
  },
  {
    productName: "Hivent 1mg/ml neb",
    initialQty: 0,
    currentQty: 0,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 0,
    newStockExp: "-",
  },
  {
    productName: "Kathrex 960mg tab",
    initialQty: 500,
    currentQty: 500,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 500,
    newStockExp: "2025-10-01",
  },
  {
    productName: "Kremil-S 178/233/30mg tab",
    initialQty: 100,
    currentQty: 96,
    oldStockQty: 300,
    oldStockExp: "2025-12-01",
    newStockQty: 96,
    newStockExp: "2026-03-01",
  },
  {
    productName: "Kremil-S Advance 10/800/165mg tab",
    initialQty: 500,
    currentQty: 350,
    oldStockQty: 46,
    oldStockExp: "2025-06-01",
    newStockQty: 350,
    newStockExp: "2025-06-01",
  },
  {
    productName: "Medicol Advance 200mg cap",
    initialQty: 500,
    currentQty: 160,
    oldStockQty: 256,
    oldStockExp: "2024-08-01",
    newStockQty: 160,
    newStockExp: "2025-01-01",
  },
  {
    productName: "Mefenamic Acid RM 500mg tab",
    initialQty: 150,
    currentQty: 150,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 150,
    newStockExp: "2024-10-01",
  },
  {
    productName: "Omepron 20mg cap",
    initialQty: 0,
    currentQty: 0,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 0,
    newStockExp: "-",
  },
  {
    productName: "Salinase Nasal Drops",
    initialQty: 1000,
    currentQty: 940,
    oldStockQty: 3,
    oldStockExp: "2028-02-01",
    newStockQty: 940,
    newStockExp: "2028-05-01",
  },
  {
    productName: "Solmux 500mg cap",
    initialQty: 5,
    currentQty: 5,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 5,
    newStockExp: "2025-06-01",
  },
  {
    productName: "Tempra 120mg/5ml syrup",
    initialQty: 100,
    currentQty: 100,
    oldStockQty: 1,
    oldStockExp: "2025-01-01",
    newStockQty: 100,
    newStockExp: "2026-01-01",
  },
  {
    productName: "Tempra 250mg/5ml syrup",
    initialQty: 500,
    currentQty: 405,
    oldStockQty: 234,
    oldStockExp: "2024-12-01",
    newStockQty: 405,
    newStockExp: "2024-12-01",
  },
  {
    productName: "Vitamins B-complex + C 500mg",
    initialQty: 500,
    currentQty: 491,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 491,
    newStockExp: "2027-06-01",
  },
  {
    productName: "Xylometazoline RM 0.1% nasal spray",
    initialQty: 250,
    currentQty: 250,
    oldStockQty: 0,
    oldStockExp: "-",
    newStockQty: 250,
    newStockExp: "2024-05-01",
  },
];

export default inventoryData;
