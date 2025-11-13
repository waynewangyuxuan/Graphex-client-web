'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

export default function ComponentPreviewPage() {
  const [progress, setProgress] = useState(60);
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-text-primary">
            Component Preview
          </h1>
          <p className="text-text-secondary">
            Showcase of all UI components in the Graphex design system
          </p>
        </div>

        {/* Buttons Section */}
        <Card className="p-6 space-y-4 border-2 border-neutral-200">
          <h2 className="text-2xl font-semibold text-neutral-900">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="success">Success</Button>
            <Button variant="error">Error</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled</Button>
            <Button>
              <Spinner size="sm" className="mr-2" />
              Loading
            </Button>
          </div>
        </Card>

        {/* Badges Section */}
        <Card className="p-6 space-y-4 border-2 border-neutral-200">
          <h2 className="text-2xl font-semibold text-neutral-900">Badges</h2>
          <p className="text-sm text-text-secondary mb-4">Node State & Semantic Badges</p>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="with-notes">With Notes</Badge>
              <Badge variant="mastered">Mastered</Badge>
              <Badge variant="needs-review">Needs Review</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="root">Root Node</Badge>
              <Badge variant="supporting">Supporting</Badge>
              <Badge variant="example">Example</Badge>
              <Badge variant="definition">Definition</Badge>
              <Badge variant="question">Question</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="success">Success</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>
        </Card>

        {/* Form Inputs Section */}
        <Card className="p-6 space-y-4 border-2 border-neutral-200">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Form Inputs
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Input Field
              </label>
              <Input placeholder="Enter some text..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Disabled Input
              </label>
              <Input placeholder="Disabled" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Textarea
              </label>
              <Textarea
                placeholder="Enter multiple lines of text..."
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* Progress & Spinner Section */}
        <Card className="p-6 space-y-4 border-2 border-neutral-200">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Loading States
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Progress Bar ({progress}%)
              </label>
              <Progress value={progress} showPercentage />
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                >
                  -10%
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                >
                  +10%
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-4">
                Spinners
              </label>
              <div className="flex gap-6 items-center">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-xs text-neutral-600">Small</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="md" />
                  <span className="text-xs text-neutral-600">Medium</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <span className="text-xs text-neutral-600">Large</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Toast Notifications Section */}
        <Card className="p-6 space-y-4 border-2 border-neutral-200">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Toast Notifications
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="success"
              onClick={() =>
                toast({
                  title: 'Success!',
                  description: 'Your action completed successfully',
                  variant: 'success',
                })
              }
            >
              Success Toast
            </Button>
            <Button
              variant="error"
              onClick={() =>
                toast({
                  title: 'Error',
                  description: 'Something went wrong',
                  variant: 'error',
                })
              }
            >
              Error Toast
            </Button>
            <Button
              variant="warning"
              onClick={() =>
                toast({
                  title: 'Warning',
                  description: 'Please be careful',
                  variant: 'warning',
                })
              }
            >
              Warning Toast
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                toast({
                  title: 'Info',
                  description: 'Here is some information',
                  variant: 'info',
                })
              }
            >
              Info Toast
            </Button>
          </div>
        </Card>

        {/* Cards Section */}
        <Card className="p-6 space-y-4 border-2 border-neutral-200">
          <h2 className="text-2xl font-semibold text-neutral-900">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-2 border-neutral-300">
              <h3 className="font-semibold text-neutral-900 mb-2">
                Default Card
              </h3>
              <p className="text-sm text-neutral-600">
                This is a card with default styling. It has subtle shadows and
                rounded corners.
              </p>
            </Card>
            <Card className="p-4 border-2 border-primary-300 bg-primary-50">
              <h3 className="font-semibold text-primary-900 mb-2">Blue Card</h3>
              <p className="text-sm text-primary-700">
                This card uses the primary blue color from the design system.
              </p>
            </Card>
            <Card className="p-4 border-2 border-warning bg-yellow-50">
              <h3 className="font-semibold text-yellow-900 mb-2">Warning Card</h3>
              <p className="text-sm text-yellow-700">
                This card uses the warning color from the design system.
              </p>
            </Card>
          </div>
        </Card>

        {/* Color Palette Section */}
        <Card className="p-6 space-y-4 border-2 border-neutral-200">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Color Palette
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">
                Primary Blue (Brand Color)
              </h3>
              <div className="grid grid-cols-5 gap-2">
                <div className="space-y-2">
                  <div className="h-16 rounded bg-primary-50 border border-primary-200"></div>
                  <span className="text-xs text-neutral-600">50</span>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-primary-200"></div>
                  <span className="text-xs text-neutral-600">200</span>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-primary-500"></div>
                  <span className="text-xs text-neutral-600">500</span>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-primary-700"></div>
                  <span className="text-xs text-neutral-600">700</span>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-primary-900"></div>
                  <span className="text-xs text-neutral-600">900</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">
                Semantic Colors
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-2">
                  <div className="h-16 rounded bg-success border border-green-300"></div>
                  <span className="text-xs text-neutral-600">Success</span>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-error border border-red-300"></div>
                  <span className="text-xs text-neutral-600">Error</span>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-warning border border-yellow-300"></div>
                  <span className="text-xs text-neutral-600">Warning</span>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-info border border-blue-300"></div>
                  <span className="text-xs text-neutral-600">Info</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">
                Neutrals (Base)
              </h3>
              <div className="grid grid-cols-5 gap-2">
                <div className="space-y-2">
                  <div className="h-16 rounded bg-neutral-50 border border-neutral-200"></div>
                  <span className="text-xs text-neutral-600">50</span>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-neutral-100"></div>
                  <span className="text-xs text-neutral-600">100</span>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-neutral-500"></div>
                  <span className="text-xs text-neutral-600">500</span>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-neutral-700"></div>
                  <span className="text-xs text-neutral-600">700</span>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded bg-neutral-900"></div>
                  <span className="text-xs text-neutral-600">900</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
