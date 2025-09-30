/* eslint-disable no-console */
const axios = require("axios");

const BASE = "http://localhost:3001";

const http = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const noAuth = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

describe("API E2E", () => {
  const ts = Date.now();
  const A = {
    email: `jest.a+${ts}@example.com`,
    password: "Sup3rS3cret!",
    name: "Jest A",
    avatar: `https://picsum.photos/seed/${ts}/200/200`,
  };

  let tokenA;
  let itemId;

  test("signup A → 201", async () => {
    const { status, data } = await http.post("/signup", A);
    expect(status).toBe(201);
    expect(data).toHaveProperty("_id");
    expect(data).toHaveProperty("email", A.email);
    expect(data).not.toHaveProperty("password");
  });

  test("signin A → 200 + token", async () => {
    const { status, data } = await http.post("/signin", {
      email: A.email,
      password: A.password,
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty("token");
    tokenA = data.token;
    http.defaults.headers.common.Authorization = `Bearer ${tokenA}`;
  });

  test("GET /items (public) → 200", async () => {
    const { status, data } = await noAuth.get("/items");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test("POST /items (protected) → 201", async () => {
    const newItem = {
      name: `Jest Hoodie ${ts}`,
      weather: "warm",
      imageUrl: `https://picsum.photos/seed/item${ts}/400/600`,
    };
    const { status, data } = await http.post("/items", newItem);
    expect(status).toBe(201);
    expect(data).toHaveProperty("_id");
    expect(data).toMatchObject({ name: newItem.name, weather: "warm" });
    itemId = data._id;
  });

  test("PUT /items/:id/likes → 200", async () => {
    const { status, data } = await http.put(`/items/${itemId}/likes`);
    expect(status).toBe(200);
    expect(data.likes).toEqual(expect.arrayContaining([expect.any(String)]));
  });

  test("DELETE /items/:id/likes → 200", async () => {
    const { status, data } = await http.delete(`/items/${itemId}/likes`);
    expect(status).toBe(200);
    expect(data.likes).toEqual(
      expect.not.arrayContaining([expect.any(String)])
    );
  });

  test("GET /users/me (protected) → 200", async () => {
    const { status, data } = await http.get("/users/me");
    expect(status).toBe(200);
    expect(data).toHaveProperty("email", A.email);
  });

  test("PATCH /users/me (protected) → 200", async () => {
    const payload = {
      name: "Jest A Updated",
      avatar: `https://picsum.photos/seed/updated${ts}/200/200`,
    };
    const { status, data } = await http.patch("/users/me", payload);
    expect(status).toBe(200);
    expect(data).toMatchObject(payload);
  });

  // Negative cases (middleware & validation)
  test("GET /users/me without token → 401", async () => {
    await expect(noAuth.get("/users/me")).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  test("signup duplicate email → 409", async () => {
    await expect(http.post("/signup", A)).rejects.toMatchObject({
      response: { status: 409 },
    });
  });

  test("POST /items invalid weather → 400", async () => {
    await expect(
      http.post("/items", {
        name: "Bad",
        weather: "freezing",
        imageUrl: "https://example.com/x.png",
      })
    ).rejects.toMatchObject({ response: { status: 400 } });
  });

  test("DELETE /items/123 bad id → 400", async () => {
    await expect(http.delete("/items/123")).rejects.toMatchObject({
      response: { status: 400 },
    });
  });

  test("PUT /items/507f1f77bcf86cd799439011/likes missing item → 404", async () => {
    await expect(
      http.put("/items/507f1f77bcf86cd799439011/likes")
    ).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  // Cleanup
  test("DELETE /items/:id as owner → 200", async () => {
    const { status, data } = await http.delete(`/items/${itemId}`);
    expect(status).toBe(200);
    expect(data).toHaveProperty("message");
  });
});
