import * as fs from 'fs';
import OpenAI from 'openai';

interface Options {
  imageFileURL: string;
}

export const imageAnalyzeUseCase = async (openai: OpenAI, options: Options) => {
  const { imageFileURL } = options; 

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "¿Qué hay en esta imagen? ¿Hay signos de fraude?" },
        {
          type: "image_url",
          image_url: {
            url: imageFileURL,
            detail: "low",
          },
        },
      ],
    }],
    max_tokens: 300,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "fraud_analysis",
        schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            nivel_riesgo: { type: "string", enum: ["Bajo", "Medio", "Alto"] },
            tips_seguridad: {
              type: "array",
              items: { type: "string" },  
            },
            enlaces: {
              type: "array",
              items: { type: "string" }, 
            },
          },
          required: ["message", "nivel_riesgo"],
        },
      },
    },
  });
    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      console.error("Error: la API devolvió una respuesta vacía.");
      return { error: "La API no devolvió contenido." };
    }
  
    let content;
    try {
      content = JSON.parse(rawContent);
    } catch (error) {
      console.error("Error al parsear la respuesta JSON:", error);
      content = { error: "La respuesta no es un JSON válido." };
    }
  
    console.log(content);
    return content;
};
