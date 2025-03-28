import OpenAI from 'openai';

interface Options {
  text: string;
}

export const textAnalyzeUseCase = async (openai: OpenAI, options: Options) => {
  const { text } = options;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Analiza el siguiente texto y determina si está relacionado con un fraude financiero.

        📌 **Criterios de análisis**:
        1️⃣ Si el texto menciona estafas, fraudes bancarios, phishing, suplantaciones de identidad o prácticas sospechosas, responde con:
           - \`"isFraudCase": true\`
           - Un análisis breve en \`"message"\`
           - El nivel de riesgo en \`"nivel_riesgo"\` (\`"Bajo"\`, \`"Medio"\`, \`"Alto"\`)
           - Consejos de seguridad en \`"tips_seguridad"\`

        2️⃣ Si el texto **no tiene relación con fraude financiero** (ejemplo: conversaciones normales, mensajes sin contexto de fraude), responde con:
           - \`"isFraudCase": false\`
           - \`"message": "El texto no está relacionado con un caso de fraude."\`
           - \`"nivel_riesgo": "No aplicable"\`
           - Listas vacías en \`"tips_seguridad"\` y \`"enlaces"\`.

        📌 **Texto a analizar**:
        "${text}"

        📌 **Formato de respuesta (JSON)**:
        {
          "isFraudCase": true o false,
          "message": "Explicación breve del análisis",
          "nivel_riesgo": "Bajo" | "Medio" | "Alto" | "No aplicable",
          "tips_seguridad": ["Consejo 1", "Consejo 2"],
          "enlaces": ["https://www.viabcp.com/campus-abc/curso-seguridad-bcp?rfid=top5:curso-seguridad", "https://www.viabcp.com/seguridad/informate"]
        }`
      }
    ],
    max_tokens: 300,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "fraud_text_analysis",
        schema: {
          type: "object",
          properties: {
            isFraudCase: { type: "boolean" },
            message: { type: "string" },
            nivel_riesgo: { type: "string", enum: ["Bajo", "Medio", "Alto", "No aplicable"] },
            tips_seguridad: {
              type: "array",
              items: { type: "string" }
            },
            enlaces: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["isFraudCase", "message", "nivel_riesgo"]
        }
      }
    }
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
