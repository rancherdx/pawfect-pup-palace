import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const SwaggerDoc = () => {
  return <SwaggerUI url="/openapi.json" />;
};

export default SwaggerDoc;
