const STORAGE_KEY = "barbear_device_id";
const COOKIE_NAME = "barbear_device_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2;

/** Persistent anonymous device id (localStorage + cookie). Client only. */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(id)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;

  return id;
}
