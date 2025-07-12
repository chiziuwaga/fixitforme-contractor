"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star,
  Calendar,
  MoreVertical,
  Bookmark,
  BookmarkCheck,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Lead {
  id: string;
  title: string;
  description: string;
  location: string;
  budget_range: [number, number];
  posted_time: string;
  urgency: 'low' | 'medium' | 'high';
  source: 'craigslist' | 'facebook' | 'nextdoor' | 'government' | 'felix_referral';
  relevance_score: number;
  contact_method: 'phone' | 'email' | 'platform';
  is_bookmarked?: boolean;
  view_count?: number;
}

interface ResponsiveLeadFeedProps {
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
  onBookmarkToggle: (leadId: string) => void;
  className?: string;
}

export function ResponsiveLeadFeed({ leads, onLeadSelect, onBookmarkToggle, className }: ResponsiveLeadFeedProps) {
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(leads);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'time' | 'budget'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'high_urgency' | 'bookmarked'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  // Auto-adjust view mode based on screen size
  useEffect(() => {
    if (isMobile) {
      setViewMode('list');
    }
  }, [isMobile]);

  // Smart filtering and sorting
  useEffect(() => {
    let filtered = [...leads];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(lead => 
        lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    switch (filterBy) {
      case 'high_urgency':
        filtered = filtered.filter(lead => lead.urgency === 'high');
        break;
      case 'bookmarked':
        filtered = filtered.filter(lead => lead.is_bookmarked);
        break;
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'relevance':
          aValue = a.relevance_score;
          bValue = b.relevance_score;
          break;
        case 'time':
          aValue = new Date(a.posted_time).getTime();
          bValue = new Date(b.posted_time).getTime();
          break;
        case 'budget':
          aValue = a.budget_range[1];
          bValue = b.budget_range[1];
          break;
        default:
          return 0;
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    setFilteredLeads(filtered);
  }, [leads, searchQuery, sortBy, sortOrder, filterBy]);

  const formatBudget = (range: [number, number]) => {
    const [min, max] = range;
    if (min === max) return `$${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getSourceBadgeColor = (source: Lead['source']) => {
    const colors = {
      craigslist: 'bg-orange-100 text-orange-800',
      facebook: 'bg-muted/50 text-foreground',
      nextdoor: 'bg-green-100 text-green-800',
      government: 'bg-secondary/10 text-secondary',
      felix_referral: 'bg-amber-100 text-amber-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  const LeadCard = ({ lead, compact = false }: { lead: Lead; compact?: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className={cn(
        "group cursor-pointer border rounded-lg transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        compact ? "p-3" : "p-4"
      )}
      onClick={() => onLeadSelect(lead)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={cn("text-xs", getSourceBadgeColor(lead.source))}>
              {lead.source.replace('_', ' ')}
            </Badge>
            {lead.urgency === 'high' && (
              <Badge variant="destructive" className="text-xs">
                Urgent
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Star className="w-3 h-3 fill-current text-yellow-500" />
              {(lead.relevance_score * 100).toFixed(0)}%
            </div>
          </div>
          
          <h3 className={cn(
            "font-semibold line-clamp-2 group-hover:text-primary transition-colors",
            compact ? "text-sm" : "text-base"
          )}>
            {lead.title}
          </h3>
          
          {!compact && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {lead.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(lead.id);
            }}
          >
            {lead.is_bookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-primary" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>
          
          {lead.view_count && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              {lead.view_count}
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className={cn(
        "flex flex-wrap items-center gap-3 text-xs text-muted-foreground",
        compact ? "mt-2" : "mt-3"
      )}>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {lead.location}
        </div>
        
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          {formatBudget(lead.budget_range)}
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {getTimeAgo(lead.posted_time)}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Smart Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className={cn(
            "flex gap-4",
            isMobile ? "flex-col" : "flex-row items-center"
          )}>
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads by title, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className={cn(
              "flex gap-2",
              isMobile ? "justify-between" : "flex-shrink-0"
            )}>
              <Select value={filterBy} onValueChange={(value) => setFilterBy(value as typeof filterBy)}>
                <SelectTrigger className={cn("w-auto", isMobile ? "flex-1" : "w-[140px]")}>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="high_urgency">High Priority</SelectItem>
                  <SelectItem value="bookmarked">Bookmarked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className={cn("w-auto", isMobile ? "flex-1" : "w-[120px]")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="time">Time Posted</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-10 h-10 p-0"
              >
                {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
              </Button>

              {!isMobile && (
                <div className="flex rounded-md border">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-r-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-l-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found
          {searchQuery && ` for "${searchQuery}"`}
        </span>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Avg. Score: {filteredLeads.length > 0 
              ? Math.round(filteredLeads.reduce((sum, lead) => sum + lead.relevance_score, 0) / filteredLeads.length * 100)
              : 0
            }%
          </Badge>
        </div>
      </div>

      {/* Lead Results */}
      <AnimatePresence mode="wait">
        {filteredLeads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leads found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className={cn(
              "grid gap-4",
              viewMode === 'grid' && !isMobile ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            )}
          >
            <AnimatePresence>
              {filteredLeads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  compact={isMobile || viewMode === 'grid'}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
