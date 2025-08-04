"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayIcon, PauseIcon, PlusIcon, SettingsIcon } from 'lucide-react';

const STAGE_OPTIONS = [
  { value: 'UNQUALIFIED', label: 'Unqualified' },
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'LOST', label: 'Lost Deal' },
];

const TRIGGER_TYPES = [
  { value: 'INTERACTION_COUNT', label: 'Interaction Count' },
  { value: 'TIME_BASED', label: 'Time Based' },
  { value: 'LEAD_HEAT_INCREASE', label: 'Lead Heat Increase' },
  { value: 'FORM_SUBMISSION', label: 'Form Submission' },
  { value: 'EMAIL_ENGAGEMENT', label: 'Email Engagement' },
];

export function StageProgressionRules() {
  const [showAddRule, setShowAddRule] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const progressionRules = useQuery(api.journeyStages.getProgressionRules);
  const initializeDefaultRules = useMutation(api.journeyStages.initializeDefaultRules);
  const runBulkProgression = useMutation(api.journeyStages.runBulkStageProgression);
  const upsertRule = useMutation(api.journeyStages.upsertProgressionRule);

  const handleInitializeRules = async () => {
    try {
      const result = await initializeDefaultRules();
      alert(result.message);
    } catch (error) {
      console.error('Failed to initialize rules:', error);
      alert('Failed to initialize rules. Please check console for details.');
    }
  };

  const handleRunBulkProgression = async () => {
    try {
      const result = await runBulkProgression();
      alert(`Bulk progression completed. ${result.progressionsMade} contacts progressed out of ${result.totalContactsEvaluated} evaluated.`);
    } catch (error) {
      console.error('Failed to run bulk progression:', error);
      alert('Failed to run bulk progression. Please check console for details.');
    }
  };

  const toggleRuleActive = async (rule: any) => {
    try {
      await upsertRule({
        ruleId: rule._id,
        fromStage: rule.fromStage,
        toStage: rule.toStage,
        triggerType: rule.triggerType,
        triggerCondition: rule.triggerCondition,
        isActive: !rule.isActive,
        priority: rule.priority,
      });
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      alert('Failed to update rule. Please check console for details.');
    }
  };

  const formatTriggerCondition = (triggerType: string, condition: any) => {
    switch (triggerType) {
      case 'INTERACTION_COUNT':
        return `≥${condition.minCount} interactions of type: ${condition.interactionTypes?.join(', ')}`;
      case 'TIME_BASED':
        return `${condition.daysSinceLastInteraction} days since last interaction + ${condition.noResponseToEmails} unanswered emails`;
      case 'LEAD_HEAT_INCREASE':
        return `Heat ≥ ${condition.minHeatLevel} + interactions: ${condition.requiredInteractions?.join(', ')}`;
      case 'FORM_SUBMISSION':
        return 'Any form submission';
      case 'EMAIL_ENGAGEMENT':
        return `Engagement score ≥ ${condition.minEngagementScore}`;
      default:
        return JSON.stringify(condition);
    }
  };

  if (progressionRules === undefined) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Stage Progression Rules</h1>
        <p className="text-gray-600">
          Configure automated rules for progressing contacts through the customer journey stages.
        </p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <button
          onClick={handleInitializeRules}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <SettingsIcon className="w-4 h-4 mr-2" />
          Initialize Default Rules
        </button>
        
        <button
          onClick={handleRunBulkProgression}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <PlayIcon className="w-4 h-4 mr-2" />
          Run Bulk Progression
        </button>
        
        <button
          onClick={() => setShowAddRule(true)}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add New Rule
        </button>
      </div>

      {/* Rules List */}
      {progressionRules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <SettingsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Progression Rules</h3>
            <p className="text-gray-600 mb-4">
              Get started by initializing the default progression rules for your venue management system.
            </p>
            <button
              onClick={handleInitializeRules}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Initialize Default Rules
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {progressionRules.map((rule) => (
            <Card key={rule._id} className={rule.isActive ? '' : 'opacity-75 bg-gray-50'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">
                      {STAGE_OPTIONS.find(s => s.value === rule.fromStage)?.label} 
                      {' → '}
                      {STAGE_OPTIONS.find(s => s.value === rule.toStage)?.label}
                    </CardTitle>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      Priority: {rule.priority}
                    </Badge>
                    <Badge variant="outline">
                      {TRIGGER_TYPES.find(t => t.value === rule.triggerType)?.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRuleActive(rule)}
                      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${
                        rule.isActive 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {rule.isActive ? (
                        <>
                          <PauseIcon className="w-3 h-3 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-3 h-3 mr-1" />
                          Activate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Trigger Condition:</h4>
                    <p className="text-sm text-gray-600">
                      {formatTriggerCondition(rule.triggerType, rule.triggerCondition)}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(rule.createdAt).toLocaleDateString()} • 
                    Updated: {new Date(rule.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Rule Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progressionRules.length}</div>
              <div className="text-sm text-gray-600">Total Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {progressionRules.filter(r => r.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {progressionRules.filter(r => !r.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Inactive Rules</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}