import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { INTERACTION_TYPE_OPTIONS, SOCIAL_PLATFORM_OPTIONS } from '@/lib/types/contact';
import type { InteractionType, SocialPlatform } from '@/lib/types/contact';

// Form validation schema
const interactionFormSchema = z.object({
  type: z.enum([
    'SOCIAL_FOLLOW',
    'SOCIAL_LIKE', 
    'SOCIAL_COMMENT',
    'SOCIAL_MESSAGE',
    'WEBSITE_VISIT',
    'INFO_REQUEST',
    'PRICE_QUOTE',
    'SITE_VISIT',
    'EMAIL_OPEN',
    'EMAIL_CLICK',
    'PHONE_CALL',
    'MEETING',
    'OTHER'
  ] as const),
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'TIKTOK'] as const).optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  customDate: z.boolean().default(false),
  interactionDate: z.date().optional(),
});

type InteractionFormData = z.infer<typeof interactionFormSchema>;

interface InteractionFormProps {
  contactId: string;
  contactName: string;
  onSubmit: (data: {
    contactId: string;
    type: InteractionType;
    platform?: SocialPlatform;
    description: string;
    metadata: Record<string, any>;
    createdAt?: number;
  }) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function InteractionForm({
  contactId,
  contactName,
  onSubmit,
  onCancel,
  isLoading = false,
  className
}: InteractionFormProps) {
  const [showCustomDate, setShowCustomDate] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<InteractionFormData>({
    resolver: zodResolver(interactionFormSchema),
    defaultValues: {
      customDate: false,
    }
  });

  const selectedType = watch('type');
  const customDate = watch('customDate');

  // Determine if platform field should be shown
  const shouldShowPlatform = selectedType && [
    'SOCIAL_FOLLOW',
    'SOCIAL_LIKE', 
    'SOCIAL_COMMENT',
    'SOCIAL_MESSAGE'
  ].includes(selectedType);

  const handleFormSubmit: SubmitHandler<InteractionFormData> = async (data) => {
    const metadata: Record<string, any> = {
      source: 'manual_entry',
      entryNotes: data.notes || undefined,
    };

    await onSubmit({
      contactId,
      type: data.type,
      platform: data.platform,
      description: data.description,
      metadata,
      createdAt: data.customDate && data.interactionDate 
        ? data.interactionDate.getTime() 
        : undefined,
    });
  };

  const getInteractionTypeWeight = (type: string) => {
    const option = INTERACTION_TYPE_OPTIONS.find(opt => opt.value === type);
    return option?.weight || 0;
  };

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <CardTitle>Add Interaction</CardTitle>
        <CardDescription>
          Record a new interaction with {contactName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Interaction Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Interaction Type *</Label>
            <Select
              onValueChange={(value) => setValue('type', value as InteractionType)}
              disabled={isLoading || isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interaction type" />
              </SelectTrigger>
              <SelectContent>
                {INTERACTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        +{option.weight} pts
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Platform (conditional) */}
          {shouldShowPlatform && (
            <div className="space-y-2">
              <Label htmlFor="platform">Social Platform</Label>
              <Select
                onValueChange={(value) => setValue('platform', value as SocialPlatform)}
                disabled={isLoading || isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.platform && (
                <p className="text-sm text-destructive">{errors.platform.message}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Brief description of the interaction"
              {...register('description')}
              disabled={isLoading || isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional context or details..."
              rows={3}
              {...register('notes')}
              disabled={isLoading || isSubmitting}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Custom Date Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="customDate"
              {...register('customDate')}
              onChange={(e) => {
                setShowCustomDate(e.target.checked);
                setValue('customDate', e.target.checked);
              }}
              disabled={isLoading || isSubmitting}
              className="rounded border-gray-300"
            />
            <Label htmlFor="customDate" className="text-sm">
              Set custom interaction date
            </Label>
          </div>

          {/* Custom Date Input */}
          {customDate && (
            <div className="space-y-2">
              <Label htmlFor="interactionDate">Interaction Date</Label>
              <Input
                id="interactionDate"
                type="datetime-local"
                {...register('interactionDate', {
                  valueAsDate: true,
                })}
                disabled={isLoading || isSubmitting}
              />
              {errors.interactionDate && (
                <p className="text-sm text-destructive">
                  {errors.interactionDate.message}
                </p>
              )}
            </div>
          )}

          {/* Heat Score Preview */}
          {selectedType && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                This interaction will add{' '}
                <span className="font-semibold text-foreground">
                  +{getInteractionTypeWeight(selectedType)} points
                </span>{' '}
                to the contact's heat score
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Adding...' : 'Add Interaction'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Quick interaction buttons for common actions
interface QuickInteractionButtonsProps {
  contactId: string;
  onAddInteraction: (type: InteractionType, description: string) => void;
  disabled?: boolean;
}

export function QuickInteractionButtons({
  contactId,
  onAddInteraction,
  disabled = false
}: QuickInteractionButtonsProps) {
  const quickActions = [
    { type: 'PHONE_CALL' as InteractionType, label: '📞 Call', description: 'Phone call with contact' },
    { type: 'MEETING' as InteractionType, label: '🤝 Meeting', description: 'Meeting with contact' },
    { type: 'EMAIL_CLICK' as InteractionType, label: '📧 Email', description: 'Email interaction' },
    { type: 'WEBSITE_VISIT' as InteractionType, label: '🌐 Visit', description: 'Website visit' },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {quickActions.map((action) => (
        <Button
          key={action.type}
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onAddInteraction(action.type, action.description)}
          className="text-xs"
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}