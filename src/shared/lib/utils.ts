export type ClassValue = string | number | boolean | undefined | null;

export function cn(...inputs: ClassValue[]) {
  // Simple fallback if deps are missing, or keep using them if we install them. 
  // Since user doesn't have them, let's use a simple joiner for now, 
  // but ideally we should install them.
  // Actually, let's use a custom implementation to be safe.
  return inputs.filter(Boolean).join(" ");
}
