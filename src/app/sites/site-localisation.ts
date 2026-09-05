export const SITE_MAP_ZOOM = 16;
export const LOCALISATION_PRECISION = 4;

/** Default map center for new sites: Tanger, Maroc. */
export const DEFAULT_SITE_LOCALISATION = {
  latitude: 35.7595,
  longitude: -5.834,
} as const;

export function roundLocalisationCoordinate(value: number): number {
  const factor = 10 ** LOCALISATION_PRECISION;
  return Math.round(value * factor) / factor;
}

export function isValidLocalisation(
  latitude: number,
  longitude: number
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}
