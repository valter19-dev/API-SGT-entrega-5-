import request from "supertest";
const base = "http://localhost:3000";

describe("Healthcheck", () => {
  it("should return ok", async () => {
    const res = await request(base).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
