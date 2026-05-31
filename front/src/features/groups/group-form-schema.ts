import { z } from "zod";
import { ru } from "@/lib/i18n/ru";

export const groupFormSchema = z.object({
  code: z.string().trim().min(1, ru.validation.required),
  title: z.string().trim().min(1, ru.validation.required),
  // Без .default(): иначе у Zod input-тип с optional, а RHF ожидает string.
  description: z.string().trim(),
  permissionCodes: z.array(z.string())
});

export type GroupFormValues = z.infer<typeof groupFormSchema>;

export function toGroupFormInput(values: GroupFormValues) {
  return {
    code: values.code,
    title: values.title,
    description: values.description.trim(),
    permissionCodes: values.permissionCodes
  };
}
