export type DocumentMode = "screen" | "print";

export interface TemplateProps<T = any> {
  data: T;
  mode?: DocumentMode;
}

export interface DocumentLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;
  pageSize?: "A4" | "A5" | "roll";
  watermark?: {
    text: string;
    opacity?: number;
  };
  branding?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
  };
  children: React.ReactNode;
}
