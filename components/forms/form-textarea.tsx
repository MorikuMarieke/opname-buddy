import { formTextareaClasses } from "@/components/forms/form-styles";
import { cn } from "@/lib/utils/cn";

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
}

export function FormTextarea({ className, ...props }: FormTextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(formTextareaClasses, className)}
    />
  );
}
