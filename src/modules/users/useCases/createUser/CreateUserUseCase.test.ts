import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("it should create a user correctly", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });
  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Test",
      email: "test@test.com",
      password: "1234",
    });

    expect(user).toHaveProperty("id");
  });
});
