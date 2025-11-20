"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm, CategoryManagement, DataManagement, DangerZone } from "@/components/features/settings"
import { Loader2, User, Tag, Database, AlertTriangle, Settings2 } from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (!response.ok) throw new Error("Error al cargar perfil")
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Error al cargar perfil</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Settings2 className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        </div>
        <p className="text-muted-foreground">
          Gestiona tu perfil, categorías y preferencias de la aplicación
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2 hover:bg-slate-200 dark:hover:bg-slate-800">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2 hover:bg-slate-200 dark:hover:bg-slate-800">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Categorías</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2 hover:bg-slate-200 dark:hover:bg-slate-800">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Datos</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-2 hover:bg-slate-200 dark:hover:bg-slate-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Avanzado</span>
          </TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile" className="space-y-4">
          <ProfileForm
            initialData={{
              name: profile.name,
              email: profile.email,
              image: profile.image,
            }}
            onUpdate={fetchProfile}
          />
        </TabsContent>

        {/* Categorías */}
        <TabsContent value="categories" className="space-y-4">
          <CategoryManagement />
        </TabsContent>

        {/* Datos */}
        <TabsContent value="data" className="space-y-4">
          <DataManagement />
        </TabsContent>

        {/* Zona de Peligro */}
        <TabsContent value="danger" className="space-y-4">
          <DangerZone />
        </TabsContent>
      </Tabs>
    </div>
  )
}
