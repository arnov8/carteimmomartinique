/**
 * Formate un prix en euros
 */
export function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(1).replace(".", ",")} M€`;
  }
  if (price >= 1_000) {
    return `${Math.round(price / 1_000)} k€`;
  }
  return `${Math.round(price)} €`;
}

/**
 * Formate un prix complet
 */
export function formatPriceFull(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formate un prix au m²
 */
export function formatPriceM2(price: number): string {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(price))} €/m²`;
}

/**
 * Formate une surface
 */
export function formatSurface(surface: number): string {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(surface))} m²`;
}

/**
 * Formate une date
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formate une date courte
 */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Couleur en fonction du prix au m²
 */
export function priceToColor(prixM2: number): string {
  // Échelle Martinique : 1000 (très bas) → 4000+ (très cher)
  if (prixM2 < 1500) return "#22c55e"; // vert
  if (prixM2 < 2000) return "#84cc16"; // vert-jaune
  if (prixM2 < 2500) return "#eab308"; // jaune
  if (prixM2 < 3000) return "#f97316"; // orange
  if (prixM2 < 3500) return "#ef4444"; // rouge
  return "#dc2626"; // rouge foncé
}

/**
 * Label du type de bien
 */
export function typeLocalLabel(type: string): string {
  const labels: Record<string, string> = {
    Maison: "Maison",
    Appartement: "Appartement",
    "Dépendance": "Dépendance",
    "Local industriel. commercial ou assimilé": "Local commercial",
    "": "Non renseigné",
  };
  return labels[type] || type;
}
