import { RedocStandalone } from 'redoc';

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
