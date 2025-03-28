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
        { type: "text", text: `
          Analiza la imagen y determina si está relacionada con fraude financiero.

          **Reglas:**
          - Si la imagen muestra documentos, transacciones, dinero, tarjetas bancarias o cualquier elemento relacionado con fraudes financieros, devuelve un análisis detallado con "isFraudCase": true.
          - Si la imagen no tiene relación con fraudes financieros (ejemplo: zapatilla, mascota, paisaje), devuelve "isFraudCase": false y un mensaje indicando que la imagen no es válida para el análisis de fraude.
        ` },
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
            isFraudCase: { type: "boolean" },
            message: { type: "string" },
            nivel_riesgo: { type: "string", enum: ["Bajo", "Medio", "Alto"] },
            tips_seguridad: { type: "array", items: { type: "string" } },
          },
          required: ["isFraudCase", "message", "nivel_riesgo"],
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

    // 🔹 Si no es un caso de fraude, modificar la respuesta
    if (!content.isFraudCase) {
      content.message = "La imagen no está relacionada con un caso de fraude.";
      content.nivel_riesgo = "No aplicable";
      content.tips_seguridad = [];
      content.enlaces = [];
    } else {
      content.enlaces = [
        "https://www.viabcp.com/campus-abc/curso-seguridad-bcp?rfid=top5:curso-seguridad",
        "https://www.viabcp.com/seguridad/informate"
      ];
    }

  } catch (error) {
    console.error("Error al parsear la respuesta JSON:", error);
    content = { error: "Ha ocurrido un error con el analisis de la imagen." };
  }

  return content;
};

