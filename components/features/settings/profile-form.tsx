"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/user"
import { toast } from "sonner"
import { Loader2, User, Mail, Image as ImageIcon } from "lucide-react"

interface ProfileFormProps {
  initialData: {
    name: string | null
    email: string
    image: string | null
  }
  onUpdate?: () => void
}

export function ProfileForm({ initialData, onUpdate }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      email: initialData.email,
      image: initialData.image || "",
    },
  })

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar perfil")
      }

      toast.success("Perfil actualizado correctamente")
      onUpdate?.()
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "Error al actualizar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="border border-slate-800">
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
        <CardDescription>
          Actualiza tu información de perfil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={initialData.image || ""} alt={initialData.name || ""} />
              <AvatarFallback className="text-xl">
                {getInitials(initialData.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Foto de perfil</p>
              <p>Tu foto de perfil se sincroniza con tu proveedor de autenticación</p>
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                Nombre
              </div>
            </Label>
            <Input
              id="name"
              placeholder="Tu nombre"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4" />
                Correo Electrónico
              </div>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* URL de Imagen */}
          <div className="space-y-2">
            <Label htmlFor="image">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4" />
                URL de Imagen (Opcional)
              </div>
            </Label>
            <Input
              id="image"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              {...register("image")}
              disabled={isLoading}
            />
            {errors.image && (
              <p className="text-sm text-red-600">{errors.image.message}</p>
            )}
          </div>

          {/* Botón Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-900 hover:bg-gray-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
