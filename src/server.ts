import { middleware } from "./middlewares/middlewares.js";
import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

const app = express();
const port = process.env.PORT ?? "9001";

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GrowthX API",
      version: "1.0.0",
      description: "API documentation for GrowthX application",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development server",
      },
    ],
  },
  // Path to the API docs. You can add more paths as needed.
  apis: ["./src/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI route
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Example API documentation for your root route
/**
 * @openapi
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Returns the root endpoint response
 *     responses:
 *       200:
 *         description: Successful response
 */
app.get("/", middleware);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});
