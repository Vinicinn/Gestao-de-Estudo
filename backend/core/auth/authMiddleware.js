import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token nao informado" });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: payload.sub,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token invalido",
      error: error.message,
    });
  }
}
