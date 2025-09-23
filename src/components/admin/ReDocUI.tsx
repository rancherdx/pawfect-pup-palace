import { RedocStandalone } from 'redoc';

/**
 * @component ReDocDoc
 * @description A component that renders the API documentation using Redoc.
 * It loads the OpenAPI specification from `/openapi.json` and applies a custom theme color.
 * @returns {React.ReactElement} The rendered Redoc documentation component.
 */
const ReDocDoc = () => {
  return (
    <RedocStandalone
      specUrl="/openapi.json"
      options={{
        theme: {
          colors: {
            primary: {
              main: '#ef4444' // brand-red
            }
          }
        }
      }}
    />
  );
};

export default ReDocDoc;
