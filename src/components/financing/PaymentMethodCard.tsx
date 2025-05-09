
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CreditCard, 
  Building2, 
  CircleDollarSign, 
  Apple 
} from "lucide-react";

interface PaymentMethodCardProps {
  name: string;
  icon: string;
  description: string;
  fee?: string;
}

const PaymentMethodCard = ({ name, icon, description, fee }: PaymentMethodCardProps) => {
  const getIcon = (): ReactNode => {
    switch (icon) {
      case "credit-card":
        return <CreditCard className="h-5 w-5 text-primary" />;
      case "building-bank":
        return <Building2 className="h-5 w-5 text-primary" />;
      case "paypal":
        return <CircleDollarSign className="h-5 w-5 text-primary" />;
      case "apple":
        return <Apple className="h-5 w-5 text-primary" />;
      default:
        return <CreditCard className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="overflow-hidden border-2 hover:border-brand-red/40 transition-all duration-300 h-full">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          {getIcon()}
          <h3 className="font-bold text-lg ml-3">{name}</h3>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
        {fee && (
          <p className="text-sm mt-2 font-medium">{fee}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;
