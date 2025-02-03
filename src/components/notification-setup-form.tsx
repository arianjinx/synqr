'use client'

import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Bell,
  Instagram,
  Link,
  Mail,
  Plus,
  Rss,
  Send,
  Twitter,
  X,
} from 'lucide-react'
import React, {useState} from 'react'

const NotificationSetupForm = () => {
  const [step, setStep] = useState(1)
  const [goals, setGoals] = useState<string[]>([])
  const [triggerType, setTriggerType] = useState('always')
  const [customCondition, setCustomCondition] = useState('')
  const [fetchInterval, setFetchInterval] = useState('hourly')
  const [sources, setSources] = useState({
    websites: [''],
    rss: [''],
    twitter: [''],
    instagram: [''],
  })
  const [outputs, setOutputs] = useState<string[]>([])

  const handleAddInput = (type: keyof typeof sources) => {
    setSources(prev => ({
      ...prev,
      [type]: [...prev[type], ''],
    }))
  }

  const handleRemoveInput = (type: keyof typeof sources, index: number) => {
    setSources(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }))
  }

  const handleInputChange = (
    type: keyof typeof sources,
    index: number,
    value: string,
  ) => {
    setSources(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => (i === index ? value : item)),
    }))
  }

  const steps = [
    {
      title: '1. Set Your Goals',
      description: 'What information do you want to track?',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Example Goals:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Track company mentions in news</li>
              <li>Monitor competitor product updates</li>
              <li>Follow industry trends</li>
            </ul>
          </div>
          <textarea
            className="w-full p-2 border rounded-md"
            placeholder="Enter your goals, one per line..."
            rows={4}
            value={goals.join('\n')}
            onChange={e => setGoals(e.target.value.split('\n'))}
          />
        </div>
      ),
    },
    {
      title: '2. Set Notification Triggers',
      description: 'When do you want to be notified?',
      icon: Send,
      content: (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="trigger"
                className="mr-2"
                checked={triggerType === 'always'}
                onChange={() => setTriggerType('always')}
              />
              Always notify immediately
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="trigger"
                className="mr-2"
                checked={triggerType === 'daily'}
                onChange={() => setTriggerType('daily')}
              />
              Daily digest
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="trigger"
                className="mr-2"
                checked={triggerType === 'custom'}
                onChange={() => setTriggerType('custom')}
              />
              Custom conditions
            </label>
          </div>

          {triggerType === 'custom' && (
            <div className="mt-4">
              <textarea
                className="w-full p-2 border rounded-md"
                placeholder="Enter your custom conditions..."
                value={customCondition}
                onChange={e => setCustomCondition(e.target.value)}
                rows={3}
              />
              <div className="mt-2 text-sm text-gray-500">
                Example: When mentioned more than 5 times in a day, or when
                specific keywords appear
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '3. Configure Data Sources',
      description: 'Where should we look for updates?',
      icon: Link,
      content: (
        <div className="space-y-6">
          {/* Global Fetch Interval */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Global Fetch Interval</h3>
            <select
              className="p-2 border rounded-md w-full"
              value={fetchInterval}
              onChange={e => setFetchInterval(e.target.value)}
            >
              <option value="hourly">Every hour</option>
              <option value="6hours">Every 6 hours</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          {/* Website URLs */}
          <div className="space-y-4">
            <h3 className="font-medium">Website Monitoring</h3>
            {sources.websites.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Enter website URL"
                  value={url}
                  onChange={e =>
                    handleInputChange('websites', index, e.target.value)
                  }
                />
                {index === sources.websites.length - 1 ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAddInput('websites')}
                  >
                    <Plus size={16} />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveInput('websites', index)}
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="font-medium">Social Media</h3>
            <div className="space-y-4">
              {/* Twitter */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Twitter size={16} />
                  <span>Twitter Usernames</span>
                </div>
                {sources.twitter.map((username, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded-md"
                      placeholder="@username"
                      value={username}
                      onChange={e =>
                        handleInputChange('twitter', index, e.target.value)
                      }
                    />
                    {index === sources.twitter.length - 1 ? (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAddInput('twitter')}
                      >
                        <Plus size={16} />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveInput('twitter', index)}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Instagram */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Instagram size={16} />
                  <span>Instagram Usernames</span>
                </div>
                {sources.instagram.map((username, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded-md"
                      placeholder="@username"
                      value={username}
                      onChange={e =>
                        handleInputChange('instagram', index, e.target.value)
                      }
                    />
                    {index === sources.instagram.length - 1 ? (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAddInput('instagram')}
                      >
                        <Plus size={16} />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveInput('instagram', index)}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RSS Feeds */}
          <div className="space-y-4">
            <h3 className="font-medium">RSS Feeds</h3>
            {sources.rss.map((feed, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Enter RSS feed URL"
                  value={feed}
                  onChange={e =>
                    handleInputChange('rss', index, e.target.value)
                  }
                />
                {index === sources.rss.length - 1 ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAddInput('rss')}
                  >
                    <Plus size={16} />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveInput('rss', index)}
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '4. Choose Output Channels',
      description: 'How do you want to receive updates?',
      icon: Mail,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} />
                <span className="font-medium">Email Digest</span>
              </div>
              <input
                type="email"
                className="w-full p-2 border rounded-md mt-2"
                placeholder="Enter email address"
              />
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <Send size={16} />
                <span className="font-medium">Telegram</span>
              </div>
              <input
                type="text"
                className="w-full p-2 border rounded-md mt-2"
                placeholder="Telegram username"
              />
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span className="font-medium">Discord</span>
              </div>
              <input
                type="text"
                className="w-full p-2 border rounded-md mt-2"
                placeholder="Discord webhook URL"
              />
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Setup Your Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Progress indicator */}
            <div className="flex justify-between mb-8">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center ${
                    i < steps.length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`
                    flex items-center justify-center w-8 h-8 rounded-full
                    ${step > i ? 'bg-blue-500 text-white' : 'bg-gray-200'}
                  `}
                  >
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > i ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Current step content */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">
                {steps[step - 1].title}
              </h2>
              <p className="text-gray-600 mb-6">
                {steps[step - 1].description}
              </p>
              {steps[step - 1].content}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  step < steps.length
                    ? setStep(step + 1)
                    : console.log('Complete')
                }
              >
                {step === steps.length ? 'Complete Setup' : 'Next'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationSetupForm
