export const felixProblemReference = {
  plumbing: [
    "running toilet repair", "leaky faucet fix", "clogged drain", "toilet flush mechanism",
    "water heater repair", "pipe leak", "sump pump", "garbage disposal", "shower head replacement"
  ],
  electrical: [
    "light fixture replacement", "electrical outlet", "circuit breaker", "ceiling fan installation",
    "panel upgrade", "GFCI outlet", "electrical inspection", "generator installation", "smart switch"
  ],
  hvac: [
    "thermostat installation", "heating repair", "AC repair", "ventilation", "HVAC maintenance",
    "ductwork cleaning", "heat pump", "furnace replacement", "air quality", "zoning system"
  ],
  carpentry: [
    "cabinet repair", "deck repair", "handrail fix", "door lock replacement",
    "custom shelving", "trim work", "stair repair", "window installation", "door hanging"
  ],
  roofing: [
    "roof leak repair", "shingle replacement", "gutter cleaning", "roof inspection",
    "emergency roof repair", "flat roof repair", "skylight repair", "ice dam removal",
    "metal roofing", "solar panel installation", "chimney repair", "fascia board replacement"
  ],
  drywall: [
    "drywall patching", "drywall repair", "hole in wall", "crack repair", "texture matching",
    "ceiling repair", "water damage repair", "wall finishing", "mud and tape",
    "drywall installation", "soundproofing", "basement finishing", "garage conversion"
  ],
  flooring: [
    "tile repair", "hardwood refinishing", "grout resealing", "floor leveling",
    "laminate installation", "carpet replacement", "vinyl plank", "subfloor repair",
    "stone restoration", "epoxy coating", "radiant heating", "transition strips"
  ],
  exterior: [
    "siding repair", "deck staining", "pressure washing", "window screen repair",
    "fence installation", "concrete repair", "walkway repair", "landscape lighting",
    "exterior painting", "caulking", "weatherstripping", "storm door installation"
  ],
  kitchen_bath: [
    "kitchen remodel", "bathroom renovation", "countertop installation", "backsplash tile",
    "vanity replacement", "shower surround", "faucet upgrade", "cabinet refacing",
    "tile work", "plumbing fixture", "exhaust fan", "lighting upgrade"
  ],
  emergency_services: [
    "emergency repair", "water damage", "storm damage", "fallen tree removal",
    "power outage", "heating emergency", "plumbing emergency", "roof emergency",
    "flood cleanup", "mold remediation", "fire damage", "structural repair"
  ]
};

export type FelixCategory = keyof typeof felixProblemReference;

export const allFelixProblems = Object.values(felixProblemReference).flat();

export const getCategoryFromProblem = (problem: string): FelixCategory | undefined => {
  for (const category in felixProblemReference) {
    if (felixProblemReference[category as FelixCategory].includes(problem)) {
      return category as FelixCategory;
    }
  }
  return undefined;
};
