
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  withPawPrintBg?: boolean;
}

const Section = ({
  id,
  title,
  subtitle,
  children,
  className,
  fullWidth = false,
  withPawPrintBg = false,
}: SectionProps) => {
  return (
    <section
      id={id}
      className={cn(
        "py-12 md:py-16", 
        withPawPrintBg && "paw-print-bg",
        className
      )}
    >
      <div className={fullWidth ? "w-full" : "container px-4 mx-auto"}>
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            )}
            {subtitle && (
              <p className="max-w-2xl mx-auto text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
