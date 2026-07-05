(function () {
  const staffNamesKey = "capriBluStaffNamesV1";
  const defaultStaffNames = [
    "Pawel",
    "Rafaele",
    "Gaetano",
    "Rosè",
    "Shan",
    "Brendon",
    "Vittorio",
    "Dylan",
    "Lorenzo",
    "Sabbit",
    "Annachiara",
    "Natalia",
    "Carmine"
  ];

  function cleanName(name) {
    return String(name || "").trim();
  }

  function uniqueNames(list) {
    const seen = new Set();
    const names = [];

    (Array.isArray(list) ? list : []).forEach((name) => {
      const clean = cleanName(name);
      if (!clean || seen.has(clean.toLowerCase())) return;
      seen.add(clean.toLowerCase());
      names.push(clean);
    });

    return names;
  }

  function readStoredNames() {
    try {
      const saved = localStorage.getItem(staffNamesKey);
      const parsed = saved ? JSON.parse(saved) : [];
      return uniqueNames(parsed);
    } catch (error) {
      return [];
    }
  }

  function getStaffNames() {
    const storedNames = readStoredNames();
    return storedNames.length ? storedNames : defaultStaffNames.slice();
  }

  function saveStaffNames(names) {
    const cleanedNames = uniqueNames(names);
    localStorage.setItem(staffNamesKey, JSON.stringify(cleanedNames.length ? cleanedNames : defaultStaffNames));
    return getStaffNames();
  }

  function updateFromStaff(staff) {
    const names = (Array.isArray(staff) ? staff : []).map((person) => person && person.nome);
    return saveStaffNames(names);
  }

  window.CapriBluStaff = {
    key: staffNamesKey,
    defaults: defaultStaffNames.slice(),
    getStaffNames,
    saveStaffNames,
    updateFromStaff
  };
}());
