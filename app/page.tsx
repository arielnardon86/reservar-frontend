import { redirect } from "next/navigation"

export default function Home() {
  // Redirigir a landing de venta (para admins)
  // En producción, esto podría detectar si es admin o cliente
  redirect("/landing")
}

