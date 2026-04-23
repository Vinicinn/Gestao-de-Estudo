import { Router } from "express";

export function contentRoutes(contentController) {
  const router = Router();

  router.get("/", (req, res) => contentController.getAllContents(req, res));                                  // eniva todos os conteudos (ok)
  router.get("/user/:id", (req, res) => contentController.getAllUserContents(req, res));                      // envia todos os conteudos de um usuario (ok)
  router.get("/:id", (req, res) => contentController.getContentById(req, res));                               // envia o conteudo com o id (ok)
  router.get("/user/:id/recommendations", (req, res) => contentController.getUserRecommendations(req, res));  // envia as recomendacoes de conteudo de um usuario 
  router.get("/:id/review-info", (req, res) => contentController.getReviewDatesInfo(req, res));
  
  router.post("/", (req, res) => contentController.createContent(req, res));                                  // cria um novo conteudo (ok)
  router.post("/:id/feedback", (req, res) => contentController.submitContentFeedback(req, res));              // atualiza as metricas de um conteudo
  
  router.put("/:id", (req, res) => contentController.updateContent(req, res));                                // atualiza conteudo pelo id (ok)
  router.put("/:id/review-dates", (req, res) => contentController.updateReviewDates(req, res));
  
  router.delete("/all", (req,res) => contentController.deleteAllContents(req,res));                           // deletar todos os conteudos (USAR EM PROD, APAGAR DPS) (ok)
  router.delete("/:id", (req, res) => contentController.deleteContent(req, res));                             // apaga um conteudo pelo id (ok)

  return router;
}
