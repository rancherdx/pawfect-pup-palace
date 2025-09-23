import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

/**
 * @component SwaggerDoc
 * @description A component that renders the API documentation using Swagger UI.
 * It loads the OpenAPI specification from the `/openapi.json` file.
 * @returns {React.ReactElement} The rendered Swagger UI component.
 */
const SwaggerDoc = () => {
  return <SwaggerUI url="/openapi.json" />;
};

export default SwaggerDoc;
