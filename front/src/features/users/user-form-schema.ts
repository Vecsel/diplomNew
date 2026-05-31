import { z } from "zod";
import { ru } from "@/lib/i18n/ru";

const base = z.object({
  username: z.string().trim().min(1, ru.validation.required),
  email: z.string().trim().email(ru.validation.email),
  firstName: z.string().trim().min(1, ru.validation.required),
  lastName: z.string().trim().min(1, ru.validation.required),
  isActive: z.boolean(),
  groupIds: z.array(z.coerce.number().int().positive()).optional()
});

export const userCreateFormSchema = base.extend({
  password: z.string().min(6, ru.validation.passwordMinCreate)
});

export const userEditFormSchema = base.extend({
  password: z.string()
}).superRefine((data, ctx) => {
  if (data.password.length > 0 && data.password.length < 6) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: ru.validation.passwordMinEdit,
      path: ["password"]
    });
  }
});

export type UserCreateFormValues = z.input<typeof userCreateFormSchema>;
export type UserEditFormValues = z.input<typeof userEditFormSchema>;

export function toUserFormInputCreate(values: UserCreateFormValues) {
  const normalizedGroupIds = (values.groupIds ?? [])
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  return {
    ...values,
    groupIds: normalizedGroupIds
  };
}

export function toUserFormInputEdit(values: UserEditFormValues) {
  const normalizedGroupIds = (values.groupIds ?? [])
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  return {
    username: values.username,
    email: values.email,
    firstName: values.firstName,
    lastName: values.lastName,
    groupIds: normalizedGroupIds,
    isActive: values.isActive,
    ...(values.password.trim() ? { password: values.password } : {})
  };
}
