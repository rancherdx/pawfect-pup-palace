
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentMethodCardProps {
  name: string;
  icon: ReactNode;
  description: string;
}

const PaymentMethodCard = ({ name, icon, description }: PaymentMethodCardProps) => {
  return (
    <Card className="overflow-hidden border-2 hover:border-brand-red/40 transition-all duration-300 h-full">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          {icon}
          <h3 className="font-bold text-lg ml-3">{name}</h3>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;
