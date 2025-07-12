/**
 * Lead and Material Cards for Chat
 * Interactive UI components for displaying agent-generated content
 * Creative and intuitive design with actionable insights
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Phone, 
  Mail, 
  ExternalLink, 
  Star,
  TrendingUp,
  Package,
  Truck,
  Store,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Users,
  Zap,
  Target,
  Award,
  Heart,
  ShoppingCart,
  Eye,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Lead Card Component
interface LeadCardProps {
  lead: {
    direct_posting_url: string;
    post_id: string;
    title: string;
    location: string;
    compensation: string;
    contact_method: string;
    posted_timestamp: Date;
    project_details: string;
    estimated_value: number;
    recency_score: number;
    source_platform: 'craigslist' | 'sams_gov' | 'municipal' | 'facebook';
    service_category: string;
  };
  onContactLead?: (leadId: string) => void;
  onSaveLead?: (leadId: string) => void;
  onAnalyzeLead?: (leadId: string) => void;
}

export function LeadCard({ lead, onContactLead, onSaveLead, onAnalyzeLead }: LeadCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Determine urgency styling based on recency score
  const getUrgencyStyle = (score: number) => {
    if (score >= 9) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'URGENT' };
    if (score >= 7) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'HOT' };
    if (score >= 5) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'WARM' };
    return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', label: 'COLD' };
  };

  const urgencyStyle = getUrgencyStyle(lead.recency_score);

  // Platform styling
  const getPlatformStyle = (platform: string) => {
    switch (platform) {
      case 'craigslist':
        return { bg: 'bg-muted/30', text: 'text-foreground', icon: '🏢' };
      case 'sams_gov':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: '🏛️' };
      case 'municipal':
        return { bg: 'bg-secondary/10', text: 'text-secondary', icon: '🏛️' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '🌐' };
    }
  };

  const platformStyle = getPlatformStyle(lead.source_platform);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSaveLead?.(lead.post_id);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just posted';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <Card className={cn(
      'w-full max-w-2xl transition-all duration-300 hover:shadow-lg relative overflow-hidden',
      urgencyStyle.bg,
      urgencyStyle.border,
      'border-l-4'
    )}>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className={cn(urgencyStyle.text, 'font-semibold')}>
                {urgencyStyle.label}
              </Badge>
              <Badge variant="secondary" className={cn(platformStyle.bg, platformStyle.text)}>
                {platformStyle.icon} {lead.source_platform.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {lead.service_category}
              </Badge>
            </div>
            
            <CardTitle className="text-lg font-bold text-gray-900 leading-tight mb-2">
              {lead.title}
            </CardTitle>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{lead.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTimeAgo(lead.posted_timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Value indicator */}
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ${lead.estimated_value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Est. Value</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Project details preview */}
        <div className="mb-4">
          <p className={cn(
            'text-gray-700 text-sm',
            !isExpanded && 'line-clamp-3'
          )}>
            {lead.project_details || 'No additional details provided.'}
          </p>
          
          {lead.project_details && lead.project_details.length > 150 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>

        {/* Compensation & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Compensation</span>
            </div>
            <p className="text-gray-900 font-semibold">{lead.compensation}</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              {lead.contact_method.includes('Phone') ? (
                <Phone className="h-4 w-4 text-secondary" />
              ) : (
                <Mail className="h-4 w-4 text-secondary" />
              )}
              <span className="text-sm font-medium text-gray-700">Contact</span>
            </div>
            <p className="text-gray-900 font-semibold text-sm">{lead.contact_method}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onContactLead?.(lead.post_id)}
              className="bg-primary hover:bg-primary/90 text-white"
              size="sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Now
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open(lead.direct_posting_url, '_blank')}
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Original
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAnalyzeLead?.(lead.post_id)}
              className="text-primary hover:text-primary/80"
            >
              <Target className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={cn(
                isSaved ? 'text-red-600 hover:text-red-800' : 'text-gray-600 hover:text-gray-800'
              )}
            >
              <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
            </Button>
          </div>
        </div>

        {/* Success indicators */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>Recency: {lead.recency_score}/10</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>Value Score: High</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            ID: {lead.post_id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Material Card Component
interface MaterialCardProps {
  material: {
    item_name: string;
    supplier: 'home_depot' | 'lowes' | 'local_supplier' | 'other';
    price: number;
    availability: 'in_stock' | 'order_required' | 'out_of_stock';
    product_url: string;
    specifications: string;
    location: string;
    last_updated: Date;
  };
  showComparison?: boolean;
  competitorPrices?: Array<{ supplier: string; price: number; availability: string }>;
  onAddToQuote?: (materialId: string) => void;
  onContactSupplier?: (materialId: string) => void;
}

export function MaterialCard({ 
  material, 
  showComparison, 
  competitorPrices, 
  onAddToQuote,
  onContactSupplier 
}: MaterialCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Supplier styling
  const getSupplierStyle = (supplier: string) => {
    switch (supplier) {
      case 'home_depot':
        return { bg: 'bg-orange-100', text: 'text-orange-700', name: 'Home Depot', icon: '🏠' };
      case 'lowes':
        return { bg: 'bg-muted/50', text: 'text-foreground', name: "Lowe's", icon: '🔧' };
      case 'local_supplier':
        return { bg: 'bg-green-100', text: 'text-green-700', name: 'Local Supplier', icon: '🏪' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', name: 'Other', icon: '🏢' };
    }
  };

  // Availability styling
  const getAvailabilityStyle = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'In Stock', icon: CheckCircle };
      case 'order_required':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'Order Required', icon: Calendar };
      case 'out_of_stock':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Out of Stock', icon: AlertTriangle };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', label: 'Unknown', icon: AlertTriangle };
    }
  };

  const supplierStyle = getSupplierStyle(material.supplier);
  const availabilityStyle = getAvailabilityStyle(material.availability);
  const AvailabilityIcon = availabilityStyle.icon;

  const handleAddToQuote = () => {
    setIsAdded(!isAdded);
    onAddToQuote?.(material.item_name);
  };

  const getCompetitivePricing = () => {
    if (!competitorPrices || competitorPrices.length === 0) return null;
    
    const allPrices = [material.price, ...competitorPrices.map(c => c.price)];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const isLowestPrice = material.price === minPrice;
    const savings = isLowestPrice ? 0 : material.price - minPrice;
    
    return { minPrice, maxPrice, isLowestPrice, savings };
  };

  const pricingInsight = getCompetitivePricing();

  return (
    <Card className="w-full max-w-2xl transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className={cn(supplierStyle.bg, supplierStyle.text)}>
                {supplierStyle.icon} {supplierStyle.name}
              </Badge>
              
              <Badge 
                variant="outline" 
                className={cn(
                  availabilityStyle.bg, 
                  availabilityStyle.border, 
                  availabilityStyle.text
                )}
              >
                <AvailabilityIcon className="h-3 w-3 mr-1" />
                {availabilityStyle.label}
              </Badge>

              {pricingInsight?.isLowestPrice && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  <Award className="h-3 w-3 mr-1" />
                  Best Price
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-lg font-bold text-gray-900 leading-tight mb-2">
              {material.item_name}
            </CardTitle>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Store className="h-4 w-4" />
                <span>{material.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Updated {new Date(material.last_updated).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Price display */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${material.price.toFixed(2)}
            </div>
            {pricingInsight && !pricingInsight.isLowestPrice && (
              <div className="text-xs text-red-600">
                +${pricingInsight.savings.toFixed(2)} vs lowest
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Specifications */}
        {material.specifications && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Specifications</h4>
            <p className={cn(
              'text-gray-600 text-sm bg-gray-50 p-3 rounded-lg',
              !isExpanded && 'line-clamp-2'
            )}>
              {material.specifications}
            </p>
            
            {material.specifications.length > 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
              >
                {isExpanded ? 'Show less' : 'Show more details'}
              </Button>
            )}
          </div>
        )}

        {/* Price comparison */}
        {showComparison && competitorPrices && competitorPrices.length > 0 && (
          <div className="mb-4 bg-primary/5 border border-primary/20 rounded-lg p-3">
            <h4 className="text-sm font-medium text-primary mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Price Comparison
            </h4>
            <div className="space-y-2">
              {competitorPrices.map((comp, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-primary/80">{comp.supplier}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">${comp.price.toFixed(2)}</span>
                    <Badge variant="outline" className="text-xs">
                      {comp.availability}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleAddToQuote}
              variant={isAdded ? "default" : "outline"}
              size="sm"
              className={cn(
                isAdded && "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isAdded ? 'Added to Quote' : 'Add to Quote'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open(material.product_url, '_blank')}
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Product
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onContactSupplier?.(material.item_name)}
              className="text-secondary hover:text-secondary/80"
            >
              <Phone className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Package className="h-3 w-3" />
              <span>Material Research</span>
            </div>
            <div className="flex items-center space-x-1">
              <Truck className="h-3 w-3" />
              <span>Delivery Available</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Live Pricing
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Container for multiple cards with smart layout
interface CardsContainerProps {
  leads?: any[];
  materials?: any[];
  title?: string;
  maxItems?: number;
  showFilters?: boolean;
}

export function CardsContainer({ 
  leads, 
  materials, 
  title, 
  maxItems = 10, 
  showFilters = false 
}: CardsContainerProps) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recency');

  const hasContent = (leads && leads.length > 0) || (materials && materials.length > 0);

  if (!hasContent) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Target className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {title || 'No results yet'}
            </h3>
            <p className="text-gray-500">
              {leads ? 'Ask Rex to find leads for your services' : 'Ask Alex for material research'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showFilters && (
            <div className="flex items-center space-x-2">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
                title="Sort results"
                aria-label="Sort results"
              >
                <option value="recency">Sort by Recency</option>
                <option value="value">Sort by Value</option>
                <option value="location">Sort by Location</option>
              </select>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {leads && leads.slice(0, maxItems).map((lead) => (
          <LeadCard key={lead.post_id} lead={lead} />
        ))}
        
        {materials && materials.slice(0, maxItems).map((material, index) => (
          <MaterialCard key={`${material.supplier}-${index}`} material={material} />
        ))}
      </div>

      {((leads && leads.length > maxItems) || (materials && materials.length > maxItems)) && (
        <div className="text-center pt-4">
          <Button variant="outline">
            Show More Results
          </Button>
        </div>
      )}
    </div>
  );
}
