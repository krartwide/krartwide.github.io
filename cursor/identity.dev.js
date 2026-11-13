// Plain JS twin so Turbopack resolves `./identity.dev.js` from identity.ts.
// Keep in sync with identity.dev.ts (the editable simulated viewer).

export const DEV_VIEWER = {
  sub: "user:dev",
  email: "dev@example.com",
  name: "Dev Viewer",
  teamId: 1,
  teamRole: "admin",
};
