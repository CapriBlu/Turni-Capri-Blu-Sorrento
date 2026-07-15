const defaultPresenceStaffNames = [
  "Pawel", "Rafaele", "Gaetano", "Rosè", "Shan", "Brendon", "Vittorio", "Dylan", "Lorenzo", "Sabbit", "Annachiara", "Natalia", "Carmine"
];

const presenceSections = [
  { key: "sala", title: "Sala", type: "sala", getNames: () => window.CapriBluStaff?.getStaffNames() || defaultPresenceStaffNames.slice() },
  { key: "pizzeria", title: "Pizzeria", type: "cucina", getNames: () => ["LUCA", "MARIO", "IGOR", "CRISTIAN", "PIETRO EXTRA"] },
  { key: "cucina", title: "Cucina /