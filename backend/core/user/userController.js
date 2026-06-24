export class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async getCurrentUser(req, res) {
    try {
      const user = await this.userService.getUserById(req.user.id);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(404).json({
        message: "Usuario nao encontrado",
        error: error.message,
      });
    }
  }

  async updateCurrentUser(req, res) {
    try {
      await this.userService.updateUser(req.user.id, req.body);
      return res.status(200).json({ message: "Usuario atualizado com sucesso" });
    } catch (error) {
      return res.status(400).json({
        message: "Erro ao atualizar usuario",
        error: error.message,
      });
    }
  }

  async deleteCurrentUser(req, res) {
    try {
      await this.userService.deleteUser(req.user.id);
      return res.status(200).json({ message: "Usuario deletado com sucesso" });
    } catch (error) {
      return res.status(400).json({
        message: "Erro ao deletar usuario",
        error: error.message,
      });
    }
  }
}
