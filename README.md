# 📌 Proyecto: Agente Cuy

## 🚀 Descripción  
Este proyecto permite analizar **texto e imágenes** para detectar posibles **fraudes financieros** utilizando **GPT-4o**. Evalúa si un mensaje o imagen contiene indicios de **phishing, estafas bancarias o intentos de suplantación de identidad**, proporcionando un **nivel de riesgo** y consejos de **seguridad**.  

## 🚀 FrontEnd  

Link del FrontEnd: https://github.com/fperez15/camucha_app

## 🛠 Tecnologías Principales  

- **NestJS**: Framework backend para construir una API robusta y escalable.  
- **OpenAI API (GPT-4o)**: Para el análisis inteligente de fraudes en texto e imagen.  
- **Multer**: Manejo de archivos para la carga de imágenes.  
- **AWS S3**: Almacenamiento seguro de imágenes en un **bucket de Amazon S3**.  
- **Vercel**: Despliegue rápido y eficiente de la API.  

## 🏗 Estructura del Proyecto  
```
├── src/
│   ├── gpt/
│   │   ├── gpt.service.ts  # Lógica de análisis de texto e imagen
│   │   ├── gpt.controller.ts  # Endpoints de la API
│   ├── main.ts  # Punto de entrada del servidor
│   ├── app.module.ts  # Módulo principal de NestJS
├── package.json
├── README.md
├── vercel.json  # Configuración de despliegue en Vercel
```  

## ⚙️ Instalación y Ejecución  

### 1️⃣ Clonar el repositorio  
```bash
git clone https://github.com/Milumon/nestjs-openai-backend.git
cd nestjs-openai-backend
```  

### 2️⃣ Instalar dependencias  
```bash
npm install
```  

### 3️⃣ Configurar variables de entorno  
Crear un archivo `.env` en la raíz con:  
```env
OPENAI_API_KEY=tu_clave_de_openai
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_S3_BUCKET=nombre-del-bucket
AWS_REGION=region-del-bucket
```  

### 4️⃣ Ejecutar en desarrollo  
```bash
npm run start:dev
```  

## 📡 Endpoints Disponibles  

### 🔹 Análisis de Texto  
- **POST** `/gpt/text-analyze`  
- **Body Example:**  
  ```json
  {
    "text": "Tienes un crédito preaprobado de 10,000 soles, solicítala con BCP http://xdsniu.cc/cx"
  }
  ```  

### 🔹 Análisis de Imágenes  
- **POST** `/gpt/image-analyze`  
- **Formato:** Form-Data con clave `file`.  
- **Formatos permitidos:** `.webp`, `.jpeg`, `.jpg`, `.png` (máximo 5MB).  
- **Almacenamiento:** Las imágenes se guardan en un **bucket de AWS S3**, y se proporciona la URL del archivo en la respuesta.  

## 🌍 Integración con AWS S3  
El sistema almacena las imágenes en un **bucket de AWS S3** para optimizar el rendimiento y garantizar la seguridad de los datos. Esto permite:  
✅ Acceso seguro y escalable a las imágenes.  
✅ Integración con la API de OpenAI para análisis eficiente.  
✅ Reducción de carga en el servidor backend.  

## 🚀 Despliegue  
El backend está desplegado en **Vercel** y se actualiza automáticamente al hacer **merge a la rama `master`**.  

🔗 **URL de la API:** [https://nestjs-openai-backend.vercel.app](https://nestjs-openai-backend.vercel.app)  

## 🎯 Objetivo en la Hackathon  
Facilitar la detección rápida y precisa de posibles **fraudes en texto e imágenes**, ayudando a usuarios y entidades a prevenir **estafas financieras**.  

🚀 **¡Listo para la evaluación!** 🎯

