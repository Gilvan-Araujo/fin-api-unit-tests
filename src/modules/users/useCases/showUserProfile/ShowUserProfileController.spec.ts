import request from "supertest";

import { app } from "../../../../app";

import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe("Show user profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show user profile", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test User 2",
      email: "test2@test.com",
      password: "123456",
    });

    const authenticatedUserResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test2@test.com",
        password: "123456",
      });

    const token = authenticatedUserResponse.body.token;

    const showProfileResponse = await request(app)
      .get("/api/v1/profile")
      .send()
      .set("Authorization", `Bearer ${token}`);

    expect(showProfileResponse.status).toBe(200);
    expect(showProfileResponse.body).toHaveProperty("id");
    expect(showProfileResponse.body).toHaveProperty("email");
    expect(showProfileResponse.body.email).toEqual("test2@test.com");
  });

  it("Should not be able to show an unauthenticated user profile", async () => {
    const showProfileResponse = await request(app)
      .get("/api/v1/profile")
      .send();

    expect(showProfileResponse.status).toBe(401);
    expect(showProfileResponse.body).toStrictEqual({
      message: "JWT token is missing!",
    });
  });
});
