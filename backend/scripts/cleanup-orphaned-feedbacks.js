import dotenv from "dotenv";
import { connectToDatabase, client } from "../config/db.js";

dotenv.config();

async function cleanupOrphanedFeedbacks() {
  try {
    console.log("🔧 Iniciando limpeza de feedbacks órfãos...");
    
    await connectToDatabase();
    const db = client.db("gestaoEstudos");
    
    const contents = db.collection("contents");
    const feedbacks = db.collection("reviewFeedbacks");
    
    // Busca todos os contentIds válidos
    const validContentIds = await contents
      .find({})
      .project({ _id: 1 })
      .toArray()
      .then(docs => docs.map(doc => doc._id.toString()));
    
    console.log(`✅ Encontrados ${validContentIds.length} conteúdos válidos`);
    
    // Busca todos os feedbacks
    const allFeedbacks = await feedbacks
      .find({ feedbackType: "review" })
      .toArray();
    
    console.log(`📊 Total de feedbacks de revisão: ${allFeedbacks.length}`);
    
    // Identifica órfãos
    const orphanedFeedbacks = allFeedbacks.filter(fb => 
      !validContentIds.includes(fb.contentId.toString())
    );
    
    console.log(`⚠️  Feedbacks órfãos encontrados: ${orphanedFeedbacks.length}`);
    
    if (orphanedFeedbacks.length > 0) {
      // Agrupa por contentId para mostrar
      const groupedByContent = {};
      orphanedFeedbacks.forEach(fb => {
        const contentId = fb.contentId.toString();
        if (!groupedByContent[contentId]) {
          groupedByContent[contentId] = 0;
        }
        groupedByContent[contentId]++;
      });
      
      console.log("\n🗑️  Conteúdos órfãos e quantidade de feedbacks:");
      Object.entries(groupedByContent).forEach(([contentId, count]) => {
        console.log(`   - ${contentId}: ${count} feedback(s)`);
      });
      
      // Deleta os órfãos
      const orphanContentIds = orphanedFeedbacks.map(fb => fb.contentId);
      const deleteResult = await feedbacks.deleteMany({
        contentId: { $in: orphanContentIds },
        feedbackType: "review"
      });
      
      console.log(`\n✅ ${deleteResult.deletedCount} feedbacks órfãos deletados com sucesso!`);
    } else {
      console.log("✅ Nenhum feedback órfão encontrado - banco de dados está limpo!");
    }
    
    await client.close();
    console.log("\n🎉 Limpeza concluída!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao limpar feedbacks:", error.message);
    process.exit(1);
  }
}

cleanupOrphanedFeedbacks();
