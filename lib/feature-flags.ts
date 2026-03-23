export function isRevampUiEnabled() {
  return process.env.ENABLE_REVAMP_UI === "true";
}

export function resolveUiMode(ui?: string | string[]) {
  const requested = Array.isArray(ui) ? ui[0] : ui;

  if (requested === "revamp" || requested === "legacy") {
    return requested;
  }

  return isRevampUiEnabled() ? "revamp" : "legacy";
}
