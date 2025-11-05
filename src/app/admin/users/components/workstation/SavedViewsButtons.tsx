'use client'

import React from 'react'
import { Users, Building2, Shield, Users2 } from 'lucide-react'
import './workstation.css'

interface SavedView {
  name: string
  label: string
  icon: React.ReactNode
  roleFilter?: string
  count?: number
  description: string
}

interface SavedViewsButtonsProps {
  activeView?: string
  onViewChange: (viewName: string, roleFilter?: string) => void
  viewCounts?: Record<string, number>
  className?: string
}

/**
 * SavedViewsButtons Component
 *
 * Phase 2: Quick-access buttons for predefined user role filters
 * Allows users to switch between different views of the user directory:
 * - All Users: Complete user list (no filter)
 * - Clients: Filtered to CLIENT role only
 * - Team: Filtered to team roles (TEAM_MEMBER, TEAM_LEAD, STAFF)
 * - Admins: Filtered to admin-level roles
 *
 * @component
 * @example
 * ```tsx
 * <SavedViewsButtons
 *   activeView="team"
 *   onViewChange={(viewName, roleFilter) => setActiveView(viewName)}
 *   viewCounts={{ all: 150, clients: 45, team: 100, admins: 5 }}
 * />
 * ```
 *
 * @param {SavedViewsButtonsProps} props - Component props
 * @param {string} [props.activeView] - Currently active view (default: 'all')
 * @param {(viewName: string, roleFilter?: string) => void} props.onViewChange - Callback when view changes
 * @param {Record<string, number>} [props.viewCounts] - User counts for each view
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Rendered view buttons
 *
 * Views:
 * - All Users: No role filter applied
 * - Clients: role=CLIENT (single role filter)
 * - Team: role=TEAM (interpreted as multiple internal team roles by backend)
 * - Admins: role=ADMIN (includes all admin-level roles)
 *
 * Accessibility:
 * - Buttons have aria-current="page" when active
 * - ARIA labels include user counts
 * - Icon + text for visibility
 * - Full keyboard navigation (Tab, Space/Enter to select)
 * - Focus visible outlines
 *
 * Performance:
 * - No React.memo needed (simple button group)
 * - Efficient state updates via callback
 * - No expensive computations
 */
export function SavedViewsButtons({
  activeView = 'all',
  onViewChange,
  viewCounts = {},
  className
}: SavedViewsButtonsProps) {
  const savedViews: SavedView[] = [
    {
      name: 'all',
      label: 'All Users',
      icon: <Users size={16} />,
      description: 'View all users in the system',
      count: viewCounts.all || 0
    },
    {
      name: 'clients',
      label: 'Clients',
      icon: <Building2 size={16} />,
      roleFilter: 'CLIENT',
      description: 'Client user accounts',
      count: viewCounts.clients || 0
    },
    {
      name: 'team',
      label: 'Team',
      icon: <Users2 size={16} />,
      // NOTE: 'TEAM' filter on backend will match TEAM_MEMBER, TEAM_LEAD, and STAFF roles
      // This provides a convenient aggregated view of internal team members
      roleFilter: 'TEAM',
      description: 'Internal team members (TEAM_MEMBER, TEAM_LEAD, STAFF)',
      count: viewCounts.team || 0
    },
    {
      name: 'admins',
      label: 'Admins',
      icon: <Shield size={16} />,
      roleFilter: 'ADMIN',
      description: 'Administrator accounts',
      count: viewCounts.admins || 0
    }
  ]

  return (
    <div className={`sidebar-section ${className || ''}`} data-testid="saved-views-section">
      <h3 className="sidebar-title">Saved Views</h3>
      <div className="sidebar-views-container" data-testid="saved-views-container">
        {savedViews.map(view => (
          <button
            key={view.name}
            onClick={() => onViewChange(view.name, view.roleFilter)}
            className={`view-btn ${activeView === view.name ? 'active' : ''}`}
            title={view.description}
            aria-pressed={activeView === view.name}
            aria-label={`${view.label} (${view.count || 0} users)`}
            data-testid={`view-btn-${view.name}`}
          >
            <span className="flex items-center gap-1">
              {view.icon}
              <span className="text-xs font-medium">{view.label}</span>
            </span>
            {view.count !== undefined && view.count > 0 && (
              <span className="text-xs font-semibold text-muted-foreground ml-auto">
                {view.count > 99 ? '99+' : view.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SavedViewsButtons
