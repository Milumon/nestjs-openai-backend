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
        "role": "user",
        "content": `
        📌 **Análisis de texto para detección de fraude financiero**  

        **Instrucciones:**  
        Eres una herramienta del BCP y analizas textos de posible fraude relacionados a tu servicio o de la competencia, analiza el siguiente texto y determina si está relacionado con fraude financiero o intento de suplantación de identidad (phishing).  

        **Criterios de detección:**  
        1️⃣ **Fraude identificado:** Si el texto menciona **documentos bancarios falsos, transacciones sospechosas, dinero, tarjetas bancarias, correos electrónicos fraudulentos o cualquier elemento asociado a fraudes financieros**, responde con:  
          - \`"isFraudCase": true\`  
          - \`"message": "Breve explicación de porqué consideras que es fraude y qué tipo de fraude sería"\`  
          - \`"nivel_riesgo": "Bajo" | "Medio" | "Alto"\`  
          - \`"tips_seguridad": ["Consejos relacionados a los tips de seguridad del bcp usando la información de enlaces y correos seguros y Consejos generales sobre fraudes relacionados al tipo de fraude, todo con un emoji al inicio", "Consejo 2"]\`  

        **Tips Seguridad BCP:**  
            Verifica siempre los remitentes. El BCP nunca te pedirá datos sensibles por mensaje o correo. ✉️
            Desconfía de los mensajes urgentes. Los estafadores usan frases como "¡Paga ahora o perderás tu cuenta!" para presionarte. 🚨
            No hagas clic en enlaces desconocidos. Si tienes dudas, ve directamente a la web o app oficial del BCP. 🔗
            🔹 Activa alertas de seguridad. Revisa la configuración de tu app BCP para recibir notificaciones sobre movimientos sospechosos. 📲

        2️⃣ **Texto legítimo del BCP:** Si el texto menciona información oficial del BCP, verifica que los datos sean correctos:  
          - Redes sociales oficiales:  
            - Facebook: **"Banco de Crédito BCP" (✔ Azul)** - 1.7M+ seguidores  
            - Instagram: **@bcpbancodecredito (✔ Azul)** - 95K+ seguidores  
            - Twitter: **@BCPComunica (✔ Azul)** - 300K+ seguidores  
            - LinkedIn: **"Banco de Crédito BCP"** - 340K+ seguidores  
          - Correos oficiales: Solo se envían desde **bcpcomunica@email.bcp.com.pe**  
          - Páginas web oficiales deben contener **".viabcp.com"** en la URL.  
            - Ejemplos válidos: **"minegociobcp.viabcp.com"**, **"www.viabcp.com/solicitar-tarjeta"**, **"dineroalinstante.viabcp.com"**  

        3️⃣ **Texto irrelevante:** Si el texto **no está relacionado con fraude financiero** (ejemplo: conversaciones normales, mensajes sin contexto de fraude), responde con:  
          - \`"isFraudCase": false\`  
          - \`"message": "El texto no está relacionado con un caso de fraude."\`  
          - \`"nivel_riesgo": "No aplicable"\`  
          - \`"tips_seguridad": []\` (lista vacía)  
          - \`"enlaces": []\` (lista vacía)  

        **Importante:**  
        - Nunca se solicitará información confidencial (claves, datos de tarjetas) a través de correos o enlaces sospechosos.  
        - Si detectas un mensaje sospechoso de fraude relacionado con el BCP, reporta el caso en **"Alerta Fraude" (Facebook)** o llama al **(01) 311 – 9898**.  

        **Texto a analizar:**  
        "${text}"
      `
      }
    ]
    ,
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
