export class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async getAllUsers(req, res) {
    const users = await this.userService.getAllUsers();
    res.json(users);
  }

  async createUser(req, res) {
    // validacao de entrada
    try {
      const { name, password } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Nome é obrigatório" });
      }
      if (!password) {
        return res.status(400).json({ message: "Senha é obrigatória" });
      }
      await this.userService.createUser({ name, password });
      res.status(201).json({ message: "usuario criado" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error ao criar usuario: ", error: error.message });
    }
  }

  async getUserById(req, res) {
    // validacao de entrada
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID é obrigatório" });
      }
      const user = await this.userService.getUserById(id);
      res.json(user);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error ao buscar usuario", error: error.message });
    }
  }

  async updateUser(req, res) {
    // validacao de entrada
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID é obrigatório" });
      }
      const update = req.body;
      await this.userService.updateUser(id, update);
      res.json({ message: "Usuario atualizado com sucesso" });
    } catch (error) {
      res.status(500).json({
        message: "Error ao atualizar usuario",
        error: error.message,
      });
    }
  }

  async deleteUser(req, res) {
    // validacao de entrada
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID é obrigatório" });
      }
      await this.userService.deleteUser(id);
      res.json({ message: "Usuario deletado com sucesso" });
    } catch (error) {
      res.status(500).json({
        message: "Error ao deletar usuario",
        error: error.message,
      });
    }
  }

  async loginVerify(req, res) {
    try {
      const { name, password } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Nome invalido" });
      }
      if (!password) {
        return res.status(400).json({ message: "Senha invalida" });
      }

      const user = await this.userService.getUserByName(name);
      if (user === null || user.password != password) {
        return res.status(400).json({ message: "Nome ou senha incorretos" });
      }

      return res
        .status(200)
        .json({ message: "usuario verificado com sucesso" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erro ao verificar usuario", error: error.message });
    }
  }
}
