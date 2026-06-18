export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async register(req, res) {
    try {
      const user = await this.authService.register(req.body);

      return res.status(201).json({
        message: "Usuario cadastrado com sucesso",
        user,
      });
    } catch (error) {
      return res.status(400).json({
        message: "Erro ao cadastrar usuario",
        error: error.message,
      });
    }
  }

  async login(req, res) {
    try {
      const authData = await this.authService.login(req.body);

      return res.status(200).json({
        message: "Login realizado com sucesso",
        ...authData,
      });
    } catch (error) {
      return res.status(401).json({
        message: "Erro ao realizar login",
        error: error.message,
      });
    }
  }

  async me(req, res) {
    try {
      const user = await this.authService.getAuthenticatedUser(req.user.id);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(404).json({
        message: "Usuario autenticado nao encontrado",
        error: error.message,
      });
    }
  }
}
