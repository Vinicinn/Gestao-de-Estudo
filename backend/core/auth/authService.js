import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  sanitizeUser(user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
    };
  }

  async register({ name, email, password }) {
    name = name?.trim();
    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!name || name.length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres");
    }
    if (!email || !email.includes("@")) {
      throw new Error("Email invalido");
    }
    if (!password || password.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres");
    }

    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new Error("Email ja cadastrado");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await this.userRepository.createUser({
      name,
      email,
      passwordHash,
    });

    return {
      id: result.insertedId,
      name,
      email,
    };
  }

  async login({ email, password }) {
    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!email || !password) {
      throw new Error("Email ou senha incorretos");
    }

    const user = await this.userRepository.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      throw new Error("Email ou senha incorretos");
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordIsValid) {
      throw new Error("Email ou senha incorretos");
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async getAuthenticatedUser(userId) {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new Error("Usuario nao encontrado");
    }

    return this.sanitizeUser(user);
  }
}
