import { describe, it, expect } from "bun:test";
import { getAuth } from "../src/auth";

describe("BetterAuth Integration Suite", () => {
  const auth = getAuth();

  it("should respond to health endpoint /api/auth/ok", async () => {
    const req = new Request("http://localhost:3000/api/auth/ok");
    const res = await auth.handler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("should create an anonymous session without email or password for trauma safety", async () => {
    const anonRes = await auth.api.signInAnonymous({
      headers: new Headers({
        "x-forwarded-for": "127.0.0.1",
      }),
    });

    expect(anonRes).toBeDefined();
    expect(anonRes.user).toBeDefined();
    expect(anonRes.user.isAnonymous).toBe(true);
    expect(anonRes.token).toBeDefined();
    expect(anonRes.token.length).toBeGreaterThan(10);
  });

  it("should register a persistent clinician account with email and password", async () => {
    const email = `clinician_${Date.now()}@kindminds.org`;
    const password = "SuperSecurePassword123!";

    const signUpRes = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: "Dr. Eleanor Vance",
      },
    });

    expect(signUpRes).toBeDefined();
    expect(signUpRes.user.email).toBe(email);
    expect(signUpRes.user.name).toBe("Dr. Eleanor Vance");
    expect(signUpRes.token).toBeDefined();

    // Verify sign in with same credentials
    const signInRes = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    expect(signInRes).toBeDefined();
    expect(signInRes.user.email).toBe(email);
    expect(signInRes.token).toBeDefined();
  });
});
