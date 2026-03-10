"use client"

import { Lock, Users, Calendar, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Idea, User } from "@/lib/store"

interface IdeaCardProps {
  idea: Idea
  user?: User | null
  onViewDetails: (idea: Idea) => void
  onJoinProject: (idea: Idea) => void
}

export function IdeaCard({ idea, user, onViewDetails, onJoinProject }: IdeaCardProps) {
  const isOwner = user?.id === idea.postedBy
  const hasJoined = idea.teamMembers.includes(user?.id || "")

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      {/* Protected Badge */}
      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-secondary/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
        <Lock className="h-3 w-3" />
        <span>Protected</span>
      </div>

      <div className="p-6">
        {/* Title */}
        <h3 className="pr-20 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          {idea.title}
        </h3>

        {/* Problem Statement */}
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {idea.problemStatement}
        </p>

        {/* Skills Required */}
        <div className="mt-4 flex flex-wrap gap-2">
          {idea.skillsRequired.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {idea.skillsRequired.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{idea.skillsRequired.length - 4} more
            </Badge>
          )}
        </div>

        {/* Meta Info */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{idea.teamMembers.length} member{idea.teamMembers.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Posted By */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {idea.postedByName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{idea.postedByName}</p>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-accent" />
                <span className="text-xs text-accent">Verified</span>
                <Star className="ml-1 h-3 w-3 text-chart-4" />
                <span className="text-xs text-muted-foreground">4.5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(idea)}
          >
            <Lock className="mr-2 h-3 w-3" />
            View Details
          </Button>
          {!isOwner && !hasJoined && (
            <Button size="sm" className="flex-1" onClick={() => onJoinProject(idea)}>
              Join Project
            </Button>
          )}
          {hasJoined && !isOwner && (
            <Button size="sm" variant="secondary" className="flex-1" disabled>
              Joined
            </Button>
          )}
          {isOwner && (
            <Button size="sm" variant="secondary" className="flex-1" disabled>
              Your Idea
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
