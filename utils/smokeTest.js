const axios = require("axios");

const BASE_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// a no-auth instance to test 401s and public routes
const noAuth = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

function pretty(label, resOrErr) {
  if (resOrErr?.status) {
    console.log(`✅ ${label} -> ${resOrErr.status}`);
    if (resOrErr.data) console.dir(resOrErr.data, { depth: 3 });
  } else if (resOrErr?.response) {
    console.log(`❌ ${label} -> ${resOrErr.response.status}`);
    console.dir(resOrErr.response.data, { depth: 5 });
  } else {
    console.log(`💥 ${label} ->`, resOrErr?.message || resOrErr);
  }
}

async function run() {
  const ts = Date.now();
  const userA = {
    email: `tester.a+${ts}@example.com`,
    password: "Sup3rS3cret!",
    name: "Tester A",
    avatar: `https://picsum.photos/seed/${ts}/200/200`,
  };
  const userB = {
    email: `tester.b+${ts}@example.com`,
    password: "Sup3rS3cret!",
    name: "Tester B",
    avatar: `https://picsum.photos/seed/${ts + 1}/200/200`,
  };

  try {
    console.log("\n=== PUBLIC: /signup (User A) ===");
    let res = await api.post("/signup", userA);
    pretty("signup A", res);

    console.log("\n=== PUBLIC: /signin (User A) ===");
    res = await api.post("/signin", {
      email: userA.email,
      password: userA.password,
    });
    pretty("signin A", res);
    const tokenA = res.data.token;
    api.defaults.headers.common.Authorization = `Bearer ${tokenA}`;

    console.log("\n=== PUBLIC: GET /items (no token) ===");
    res = await noAuth.get("/items");
    pretty("get items (public)", res);

    console.log("\n=== PROTECTED: POST /items (create by A) ===");
    const newItem = {
      name: `Comfy Hoodie ${ts}`,
      weather: "warm", // enum: hot | warm | cold
      imageUrl: `https://picsum.photos/seed/item${ts}/400/600`,
    };
    res = await api.post("/items", newItem);
    pretty("create item", res);
    const itemId = res.data?._id;

    console.log("\n=== PROTECTED: PUT /items/:id/likes (A likes) ===");
    res = await api.put(`/items/${itemId}/likes`);
    pretty("like item", res);

    console.log("\n=== PROTECTED: DELETE /items/:id/likes (A unlikes) ===");
    res = await api.delete(`/items/${itemId}/likes`);
    pretty("dislike item", res);

    console.log("\n=== PROTECTED: GET /users/me (A) ===");
    res = await api.get("/users/me");
    pretty("getCurrentUser A", res);

    console.log("\n=== PROTECTED: PATCH /users/me (A) ===");
    res = await api.patch("/users/me", {
      name: "Tester A Updated",
      avatar: `https://picsum.photos/seed/updated${ts}/200/200`,
    });
    pretty("updateCurrentUser A", res);

    // --- Intentionally trigger common errors ---
    console.log("\n=== ERROR: GET /users/me without token -> 401 ===");
    let err;
    try {
      await noAuth.get("/users/me");
    } catch (e) {
      err = e;
    }
    pretty("users/me (no token)", err);

    console.log("\n=== ERROR: POST /signup duplicate email -> 409 ===");
    try {
      await api.post("/signup", userA);
    } catch (e) {
      err = e;
    }
    pretty("signup duplicate", err);

    console.log("\n=== ERROR: POST /items invalid weather -> 400 ===");
    try {
      await api.post("/items", {
        name: "Bad Weather Item",
        weather: "freezing", // invalid enum
        imageUrl: "https://example.com/image.png",
      });
    } catch (e) {
      err = e;
    }
    pretty("create item invalid weather", err);

    console.log("\n=== ERROR: DELETE /items/123 (bad id) -> 400 ===");
    try {
      await api.delete("/items/123");
    } catch (e) {
      err = e;
    }
    pretty("delete item bad id", err);

    console.log("\n=== ERROR: PUT /items/:nonexistent/likes -> 404 ===");
    try {
      await api.put("/items/507f1f77bcf86cd799439011/likes"); // valid ObjectId shape, unlikely to exist
    } catch (e) {
      err = e;
    }
    pretty("like nonexistent item", err);

    // --- Ownership / 403 test ---
    console.log("\n=== PUBLIC: /signup (User B) ===");
    res = await api.post("/signup", userB); // using api is fine; server ignores token here
    pretty("signup B", res);

    console.log("\n=== PUBLIC: /signin (User B) ===");
    res = await noAuth.post("/signin", {
      email: userB.email,
      password: userB.password,
    });
    pretty("signin B", res);
    const tokenB = res.data.token;

    // axios instance for user B
    const apiB = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenB}`,
      },
      timeout: 10_000,
    });

    console.log(
      "\n=== PROTECTED: DELETE /items/:id as NON-OWNER (B) -> 403 ==="
    );
    try {
      await apiB.delete(`/items/${itemId}`);
    } catch (e) {
      err = e;
    }
    pretty("delete item as B (forbidden)", err);

    console.log("\n=== PROTECTED: DELETE /items/:id as OWNER (A) -> 200 ===");
    const resDel = await api.delete(`/items/${itemId}`);
    pretty("delete item as A", resDel);

    console.log("\n=== PUBLIC: GET /items (confirm list) ===");
    res = await noAuth.get("/items");
    pretty("get items end", res);

    console.log("\n🎉 All requests finished.");
  } catch (fatal) {
    pretty("FATAL", fatal);
    process.exitCode = 1;
  }
}

run();
