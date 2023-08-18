import request from "supertest";

import { app } from "../../../../app";

import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe("Get Statement Operation", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get statement operation", async () => {
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

    const createStatementResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit",
      })
      .set("Authorization", `Bearer ${token}`);

    const { id } = createStatementResponse.body;

    const getStatementOperationResponse = await request(app)
      .get(`/api/v1/statements/${id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(getStatementOperationResponse.status).toBe(200);
    expect(getStatementOperationResponse.body).toHaveProperty("id");
  });

  it("Should not be able to get a statement of an unauthenticated user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Letícia Samara",
      email: "leticia@email.com",
      password: "654321",
    });

    const authenticatedUserResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "leticia@email.com",
        password: "654321",
      });

    const token = authenticatedUserResponse.body.token;

    const createStatementResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit",
      })
      .set("Authorization", `Bearer ${token}`);

    const { id } = createStatementResponse.body;

    const getStatementOperationResponse = await request(app)
      .get(`/api/v1/statements/${id}`)
      .send();

    expect(getStatementOperationResponse.status).toBe(401);
    expect(getStatementOperationResponse.body).toStrictEqual({
      message: "JWT token is missing!",
    });
  });

  it("Should not be able to get an inexistent statement operation", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test User 1",
      email: "test@email.com",
      password: "654321",
    });

    const authenticatedUserResponse = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@email.com",
        password: "654321",
      });

    const token = authenticatedUserResponse.body.token;

    const getStatementOperationResponse = await request(app)
      .get(`/api/v1/statements/b5445d57-7e3d-4675-bd4e-7e246eb50791`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(getStatementOperationResponse.status).toBe(404);
    expect(getStatementOperationResponse.body).toStrictEqual({
      message: "Statement not found",
    });
  });
});
