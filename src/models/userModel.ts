import { z } from 'zod';

export const schemaUserCreate = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'La confirmación es obligatoria'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const schemaUserUpdate = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const schemaUser = schemaUserCreate;

export type UserFormValues = z.infer<typeof schemaUserCreate>;
export type UserUpdateFormValues = z.infer<typeof schemaUserUpdate>;

export interface UserType {
  id: number;
  username: string;
  active: boolean;
  createdAt: string;
}