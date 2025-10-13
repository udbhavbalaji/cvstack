import "enquirer";

declare module "enquirer" {
  export interface Choice<Value> {
    name: string;
    initial?: Value;
    message?: string;
    value?: Value;
    hint?: string;
    role?: string;
    enabled?: boolean;
    disabled?: boolean | string;
  }
}
