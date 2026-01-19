import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export const SignupSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  whatsapp: z.string().min(10, { message: "Nomor WhatsApp minimal 10 digit" }),
  role: z.enum(["buyer", "seller"]).optional(),
});
