"use client";

import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";

interface CategoryBadgeProps {
  name: string;
  color?: string;
  icon?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function CategoryBadge({
  name,
  color = "#6B7280",
  icon = "Tag",
  size = "md",
  showIcon = true,
}: CategoryBadgeProps) {
  // Obtener el componente del icono
  const IconComponent = (Icons as any)[icon] || Icons.Tag;

  // Tamaños
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <Badge
      variant="secondary"
      className={`${sizeClasses[size]} border-none font-medium inline-flex items-center gap-1.5`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {showIcon && <IconComponent className={iconSizes[size]} />}
      <span className="truncate">{name}</span>
    </Badge>
  );
}
