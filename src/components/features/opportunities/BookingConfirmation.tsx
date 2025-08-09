"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Mail, 
  Phone, 
  CheckCircle, 
  Send, 
  Download,
  Euro,
  AlertTriangle
} from "lucide-react";
import type { BookingConfirmation, Venue } from "@/lib/types/venue";
import type { Opportunity } from "@/lib/types/opportunity";

interface BookingConfirmationProps {
  opportunity: Opportunity;
  venue: Venue;
  contact: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  onConfirm?: (confirmation: BookingConfirmation) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

export function BookingConfirmation({
  opportunity,
  venue,
  contact,
  onConfirm,
  onCancel,
  isOpen
}: BookingConfirmationProps) {
  const [step, setStep] = useState<'review' | 'pricing' | 'confirm' | 'complete'>('review');
  const [pricing, setPricing] = useState({
    venueRate: venue.hourlyRate || venue.dailyRate || 0,
    duration: 4, // hours
    additionalServices: [] as Array<{ name: string; cost: number }>,
    deposit: 0.3, // 30% deposit
    taxes: 0.21, // 21% VAT
  });
  const [confirmation, setConfirmation] = useState<Partial<BookingConfirmation>>({});
  const [emailTemplate, setEmailTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const calculateTotalCost = () => {
    const baseRate = pricing.venueRate * pricing.duration;
    const servicesTotal = pricing.additionalServices.reduce((sum, service) => sum + service.cost, 0);
    const subtotal = baseRate + servicesTotal;
    const taxAmount = subtotal * pricing.taxes;
    const total = subtotal + taxAmount;
    
    return {
      baseRate,
      servicesTotal,
      subtotal,
      taxAmount,
      total,
      depositAmount: total * pricing.deposit
    };
  };

  const generateEmailTemplate = () => {
    const costs = calculateTotalCost();
    const eventDate = new Date(opportunity.eventDate);
    
    return `Dear ${contact.name},

We are delighted to confirm your event booking at ${venue.name}.

EVENT DETAILS:
• Event: ${opportunity.name}
• Date: ${eventDate.toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
• Time: ${eventDate.toLocaleTimeString('en-US', { 
  hour: '2-digit', 
  minute: '2-digit' 
})}
• Duration: ${pricing.duration} hours
• Guests: ${opportunity.guestCount}
• Venue: ${venue.name}${venue.location ? ` - ${venue.location}` : ''}

PRICING BREAKDOWN:
• Venue rental (${pricing.duration}h): €${costs.baseRate.toFixed(2)}${pricing.additionalServices.length > 0 ? `
• Additional services: €${costs.servicesTotal.toFixed(2)}` : ''}
• Subtotal: €${costs.subtotal.toFixed(2)}
• VAT (21%): €${costs.taxAmount.toFixed(2)}
• TOTAL: €${costs.total.toFixed(2)}

DEPOSIT REQUIRED: €${costs.depositAmount.toFixed(2)} (${(pricing.deposit * 100)}%)

${venue.amenities && venue.amenities.length > 0 ? `
INCLUDED AMENITIES:
${venue.amenities.map(amenity => `• ${amenity.replace('_', ' ')}`).join('\n')}
` : ''}
${opportunity.venueRequirements ? `
SPECIAL REQUIREMENTS:
${opportunity.venueRequirements}
` : ''}
Please confirm this booking by replying to this email. A deposit of €${costs.depositAmount.toFixed(2)} is required to secure your reservation.

We look forward to hosting your event!

Best regards,
Event Management Team`;
  };

  const handleStepNext = () => {
    switch (step) {
      case 'review':
        setStep('pricing');
        break;
      case 'pricing':
        setStep('confirm');
        setEmailTemplate(generateEmailTemplate());
        break;
      case 'confirm':
        handleConfirmBooking();
        break;
    }
  };

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    
    const costs = calculateTotalCost();
    const bookingConfirmation: BookingConfirmation = {
      opportunityId: opportunity._id,
      venueId: venue._id,
      contactEmail: contact.email,
      eventDetails: {
        name: opportunity.name,
        date: opportunity.eventDate,
        duration: pricing.duration * 60 * 60 * 1000, // Convert to milliseconds
        guestCount: opportunity.guestCount,
        specialRequirements: opportunity.venueRequirements,
      },
      venue: {
        name: venue.name,
        location: venue.location,
        amenities: venue.amenities || [],
      },
      pricing: {
        venueRate: pricing.venueRate,
        totalCost: costs.total,
        deposit: costs.depositAmount,
      },
    };
    
    setConfirmation(bookingConfirmation);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onConfirm?.(bookingConfirmation);
      setStep('complete');
    } catch (error) {
      console.error('Booking confirmation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel?.()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Booking Confirmation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center gap-4">
            <StepIndicator
              steps={['Review', 'Pricing', 'Confirm', 'Complete']}
              currentStep={step}
            />
          </div>

          {step === 'review' && (
            <ReviewStep 
              opportunity={opportunity}
              venue={venue}
              contact={contact}
              onNext={handleStepNext}
              onCancel={onCancel}
            />
          )}

          {step === 'pricing' && (
            <PricingStep
              venue={venue}
              pricing={pricing}
              onPricingChange={setPricing}
              onNext={handleStepNext}
              onBack={() => setStep('review')}
            />
          )}

          {step === 'confirm' && (
            <ConfirmStep
              emailTemplate={emailTemplate}
              onEmailChange={setEmailTemplate}
              onConfirm={handleStepNext}
              onBack={() => setStep('pricing')}
              isLoading={isLoading}
              costs={calculateTotalCost()}
            />
          )}

          {step === 'complete' && (
            <CompleteStep
              confirmation={confirmation as BookingConfirmation}
              onClose={onCancel}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ 
  steps, 
  currentStep 
}: { 
  steps: string[]; 
  currentStep: string; 
}) {
  const stepIndex = steps.findIndex(step => step.toLowerCase() === currentStep);
  
  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${index <= stepIndex 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
            }
          `}>
            {index + 1}
          </div>
          <span className={`ml-2 text-sm ${
            index <= stepIndex ? 'text-blue-600 font-medium' : 'text-gray-500'
          }`}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className={`mx-4 h-0.5 w-8 ${
              index < stepIndex ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ReviewStep({ 
  opportunity, 
  venue, 
  contact, 
  onNext, 
  onCancel 
}: {
  opportunity: Opportunity;
  venue: Venue;
  contact: any;
  onNext: () => void;
  onCancel?: () => void;
}) {
  const eventDate = new Date(opportunity.eventDate);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Event Name</Label>
              <p className="font-medium">{opportunity.name}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <Label className="text-sm font-medium text-gray-600">Date & Time</Label>
                <p>{eventDate.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <Label className="text-sm font-medium text-gray-600">Guest Count</Label>
                <p>{opportunity.guestCount} guests</p>
              </div>
            </div>
            
            <div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {opportunity.eventType.replace('_', ' ')}
              </Badge>
            </div>

            {opportunity.venueRequirements && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Special Requirements</Label>
                <p className="text-sm">{opportunity.venueRequirements}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Venue Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Venue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-medium">{venue.name}</p>
                {venue.location && <p className="text-sm text-gray-600">{venue.location}</p>}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">Capacity</Label>
              <p>Up to {venue.capacity} guests</p>
            </div>

            {venue.amenities && venue.amenities.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Amenities</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {venue.amenities.map(amenity => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {venue.description && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-sm">{venue.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Name</Label>
              <p className="font-medium">{contact.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p>{contact.email}</p>
              </div>
            </div>
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p>{contact.phone}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onNext}>
          Continue to Pricing
        </Button>
      </div>
    </div>
  );
}

function PricingStep({ 
  venue, 
  pricing, 
  onPricingChange, 
  onNext, 
  onBack 
}: {
  venue: Venue;
  pricing: any;
  onPricingChange: (pricing: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const costs = {
    baseRate: pricing.venueRate * pricing.duration,
    servicesTotal: pricing.additionalServices.reduce((sum: number, service: any) => sum + service.cost, 0),
  };
  costs.subtotal = costs.baseRate + costs.servicesTotal;
  costs.taxAmount = costs.subtotal * pricing.taxes;
  costs.total = costs.subtotal + costs.taxAmount;
  costs.depositAmount = costs.total * pricing.deposit;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Event Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="venueRate">Venue Rate (per hour)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Euro className="w-4 h-4 text-gray-500" />
                <Input
                  id="venueRate"
                  type="number"
                  value={pricing.venueRate}
                  onChange={(e) => onPricingChange({
                    ...pricing,
                    venueRate: Number(e.target.value)
                  })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <Input
                  id="duration"
                  type="number"
                  value={pricing.duration}
                  onChange={(e) => onPricingChange({
                    ...pricing,
                    duration: Number(e.target.value)
                  })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label>Pricing Breakdown</Label>
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Venue rental ({pricing.duration}h)</span>
                <span>€{costs.baseRate.toFixed(2)}</span>
              </div>
              {costs.servicesTotal > 0 && (
                <div className="flex justify-between">
                  <span>Additional services</span>
                  <span>€{costs.servicesTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>€{costs.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (21%)</span>
                <span>€{costs.taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>€{costs.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>Deposit Required (30%)</span>
                <span>€{costs.depositAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue to Confirmation
        </Button>
      </div>
    </div>
  );
}

function ConfirmStep({ 
  emailTemplate, 
  onEmailChange, 
  onConfirm, 
  onBack, 
  isLoading, 
  costs 
}: {
  emailTemplate: string;
  onEmailChange: (template: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
  costs: any;
}) {
  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Review the confirmation email that will be sent to the client. You can edit the template as needed.
        </AlertDescription>
      </Alert>

      <div>
        <Label htmlFor="emailTemplate">Confirmation Email</Label>
        <Textarea
          id="emailTemplate"
          value={emailTemplate}
          onChange={(e) => onEmailChange(e.target.value)}
          rows={20}
          className="mt-1 font-mono text-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Final Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-semibold">€{costs.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Deposit Required:</span>
              <span className="font-semibold text-blue-600">€{costs.depositAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button onClick={onConfirm} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Sending Confirmation...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Confirmation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function CompleteStep({ 
  confirmation, 
  onClose 
}: {
  confirmation: BookingConfirmation;
  onClose?: () => void;
}) {
  return (
    <div className="text-center space-y-6 py-8">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600">
          The confirmation email has been sent to {confirmation.contactEmail}. 
          The venue has been booked and the opportunity has been updated.
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Contract
        </Button>
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}