import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BookShelf API",
      version: "1.0.0",
      description:
        "Daily Book Insights Wallpaper App — Backend API Documentation",
    },
    servers: [
      {
        url: "/api/v1",
        description: "API v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errorCode: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            phone: { type: "string", example: "+919876543210" },
            email: { type: "string", nullable: true },
            preferredLanguage: { type: "string", example: "en" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
          },
        },
        Book: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string", example: "Atomic Habits" },
            author: { type: "string", example: "James Clear" },
            category: { type: "string", example: "Self Help" },
            coverImage: { type: "string", nullable: true },
            price: { type: "number", example: 99.0 },
            totalQuotes: { type: "integer", example: 35 },
            isActive: { type: "boolean", example: true },
          },
        },
        Purchase: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            bookId: { type: "string", format: "uuid" },
            durationDays: { type: "integer", example: 30 },
            platform: {
              type: "string",
              enum: ["GOOGLE_PLAY", "APP_STORE"],
            },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            status: {
              type: "string",
              enum: ["ACTIVE", "EXPIRED", "REFUNDED"],
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
