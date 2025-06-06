import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, UserCheck, BarChartHorizontalBig } from 'lucide-react';

const AdvancedSecurityFeatures: React.FC = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-6">
        <ShieldCheck className="h-8 w-8 mr-3 text-brand-red" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Advanced Security & Risk Management (Future Scope)
        </h2>
      </div>

      <p className="text-muted-foreground mb-8">
        The features outlined below are planned enhancements to further improve platform security, user trust, and risk mitigation.
        They typically involve integration with specialized third-party services and complex backend logic.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <UserCheck className="h-6 w-6 mr-2 text-blue-500" />
              Face/ID Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Planned: Integration with a third-party service for enhanced user identity verification during critical operations
              (e.g., high-value transactions, account recovery, listing high-value puppies/studs).
            </p>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Note:</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Requires vendor selection (e.g., Persona, Veriff, Stripe Identity) and API integration.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <BarChartHorizontalBig className="h-6 w-6 mr-2 text-green-500" />
              Square Transaction Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Planned: Develop logic to assess transaction risk based on Square payment data (amount, card type, location if available),
              purchase price, user history, and other behavioral factors.
            </p>
            <div className="p-2 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded">
              <p className="text-xs font-medium text-green-700 dark:text-green-300">Implementation Note:</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                This may involve custom rule engines, analysis of data from Square's Risk Manager (if API accessible), or integration with other fraud prevention services.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <AlertTriangle className="h-6 w-6 mr-2 text-orange-500" />
              Conditional Triggers & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Planned: Implement conditional triggers based on risk assessments from transaction analysis or ID verification results.
            </p>
            <p className="text-sm text-muted-foreground">
              Potential actions could include:
            </p>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pl-2">
              <li>Requiring further verification steps (e.g., 2FA, ID check).</li>
              <li>Placing accounts or transactions on temporary review/hold.</li>
              <li>Notifying administrators of high-risk activities.</li>
              <li>Limiting access to certain features until verification is complete.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 p-4 bg-background dark:bg-gray-800/50 border dark:border-gray-700 rounded-lg">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Implementation Considerations:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>These features often have privacy implications and require clear user consent and data handling policies.</li>
            <li>Costs associated with third-party verification services need to be evaluated.</li>
            <li>User experience must be carefully designed to minimize friction for legitimate users.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdvancedSecurityFeatures;
