import { BarteErrorProps } from "../../types";

export function isBarteDuplicatedCustomerError(err: BarteErrorProps): boolean {
    return err?.response?.data?.errors?.[0]?.code === "BAR-1801";
}